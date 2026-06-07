# Games Frontend OCP CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the game frontend (`feg_games_src`) to FEG OCP clusters using Jenkins CI/CD, serving all games as static files via an nginx container.

**Architecture:** Jenkins builds static files in workspace (`npm ci` + `npm run build`), packages them into an OCP-native nginx `1.26-ubi10` container using buildah, pushes to Quay, deploys via Helm. Three image variants per release: `${SHA}-dev` (TST), `${SHA}-stg` (STG), `${SHA}-prod` (PROD) - each with different Vite env vars baked in. Single Jenkinsfile with `DEPLOY_TARGET` parameter: `release/*` push auto-deploys STG; manual re-trigger with `DEPLOY_TARGET=prod` deploys PROD with a fresh production build.

**Tech Stack:** Jenkins (kubernetes agent: `node22 buildah`), buildah (OCI image builder), nginx `1.26-ubi10` (OCP imagestream), Helm 4, Quay registry (`registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe`), Nexus npm registry, OCP (`gaming-studio-shared` namespace for TST), Node.js 22 (build only - no runtime), Vite + npm.

---

## Confirmed Values

| Item | Value |
|------|-------|
| Quay registry | `registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe` (already created) |
| OCP namespace TST | `gaming-studio-shared` |
| OCP namespace STG | `gaming-studio-stg` |
| OCP namespace PROD | `gaming-studio-prod` |
| Helm release name | `feg-slot-games-fe` |
| nginx port | `8080` |
| Bitbucket SSH (feg_games_src) | `ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_src.git` |
| Bitbucket SSH (feg_games_assets) | `ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_assets.git` |
| Vault path | `jenkins/gaming-studio` key `kubeconfig_bm` |
| Nexus URL | `https://nexus.svc.ifortuna.cz` |
| Proxy | `http://10.0.68.20:3128` |

## File Map

| File | Action |
|------|--------|
| `.npmrc` | Create - Nexus registry URL, no auth token |
| `Dockerfile.ocp` | Create - nginx base image + COPY build output |
| `sonar-project.properties` | Create - SonarQube project config |
| `Jenkinsfile` | Create - full multibranch pipeline |
| `infra/nginx/default.conf` | Create - nginx server block, port 8080, cache headers |
| `infra/helm/feg-slot-games-fe/Chart.yaml` | Create |
| `infra/helm/feg-slot-games-fe/values.yaml` | Create |
| `infra/helm/feg-slot-games-fe/values-tst.yaml` | Create |
| `infra/helm/feg-slot-games-fe/values-stg.yaml` | Create |
| `infra/helm/feg-slot-games-fe/values-prod.yaml` | Create |
| `infra/helm/feg-slot-games-fe/templates/deployment.yaml` | Create |
| `infra/helm/feg-slot-games-fe/templates/service.yaml` | Create |
| `infra/helm/feg-slot-games-fe/templates/route.yaml` | Create |

---

## Task 0: Pre-work - Switch npm to Nexus Locally

Runs locally BEFORE Tasks 1-5. Ensures `package-lock.json` has Nexus URLs so `npm ci` works in Jenkins (Jenkins npm points to Nexus; lock file with `registry.npmjs.org` URLs causes mismatches).

No `@pixentech` private packages in this repo - only public npm packages. No private registry auth needed in `.npmrc`.

**Files:**
- Create: `.npmrc`
- Regenerate: `package-lock.json`

- [ ] **Step 1: Create `.npmrc` at repo root**

```
registry=https://nexus.svc.ifortuna.cz/repository/npmjs_org/
strict-ssl=false
```

No auth token - credentials injected at Jenkins build time via `nexus-token` credential.

- [ ] **Step 2: Regenerate `package-lock.json` against Nexus**

You need local Nexus access. Add credentials to your personal `~/.npmrc` (do NOT commit this file):

```
//nexus.svc.ifortuna.cz/repository/npmjs_org/:_auth=<your-base64-nexus-token>
```

Then regenerate:

```bash
rm -rf package-lock.json node_modules
npm install
```

- [ ] **Step 3: Verify lock file has Nexus URLs**

```bash
grep "nexus.svc.ifortuna.cz" package-lock.json | head -5
```

Expected: lines containing `https://nexus.svc.ifortuna.cz/repository/npmjs_org/` for package tarballs.

---

## Task 1: Create Dockerfile.ocp

Build output is produced in Jenkins workspace. Dockerfile only packages the output into nginx.

**Files:**
- Create: `Dockerfile.ocp`

- [ ] **Step 1: Create `Dockerfile.ocp`**

```dockerfile
FROM image-registry.openshift-image-registry.svc:5000/openshift/nginx:1.26-ubi10

COPY feg_slot_build/ /usr/share/nginx/html/
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
```

Notes:
- `feg_slot_build/` is created in Jenkins workspace via `BUILD_OUTPUT_ROOT=${WORKSPACE}/feg_slot_build npm run build:development`
- UBI nginx image pre-configured for OCP: user 1001 (non-root), port 8080, pid/temp paths already set
- Only `conf.d/default.conf` (server block) is overridden - the main `nginx.conf` handles non-root setup
- Base image pulled from OCP internal imagestream - buildah in Jenkins pod authenticates via service account token

- [ ] **Step 2: Verify syntax**

```bash
docker build --no-cache --dry-run -f Dockerfile.ocp . 2>&1 || echo "dry-run not supported - syntax check only"
```

If `docker` is unavailable locally, defer to Jenkins first-run verification.

---

## Task 2: Create nginx Server Config

**Files:**
- Create: `infra/nginx/default.conf`

- [ ] **Step 1: Create `infra/nginx/` directory and `default.conf`**

```bash
mkdir -p infra/nginx
```

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;

    # Security headers (mirrors staticwebapp.config.json globalHeaders)
    add_header X-Content-Type-Options  "nosniff" always;
    add_header X-Frame-Options         "SAMEORIGIN" always;
    add_header Referrer-Policy         "strict-origin-when-cross-origin" always;

    # Serve pre-compressed .gz files automatically
    # Vite generates .gz alongside originals (deleteOriginalAssets: false)
    gzip_static on;

    # Immutable hashed assets - JS, CSS, fonts (content-hashed filenames)
    location ~* \.(js|css|woff2?|ttf)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Game assets - sounds, spines, images (change infrequently)
    location ~* \.(mp3|ogg|wav|atlas|skel|png|jpg|webp|svg|ico)$ {
        add_header Cache-Control "public, max-age=86400";
    }

    # Runtime config - never cache (loaded fresh every game session)
    location = /assets/env/commonConfig.json {
        add_header Cache-Control "no-store, no-cache";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## Task 3: Create Helm Chart

**Files:**
- Create: `infra/helm/feg-slot-games-fe/Chart.yaml`
- Create: `infra/helm/feg-slot-games-fe/values.yaml`
- Create: `infra/helm/feg-slot-games-fe/values-tst.yaml`
- Create: `infra/helm/feg-slot-games-fe/values-stg.yaml`
- Create: `infra/helm/feg-slot-games-fe/values-prod.yaml`
- Create: `infra/helm/feg-slot-games-fe/templates/deployment.yaml`
- Create: `infra/helm/feg-slot-games-fe/templates/service.yaml`
- Create: `infra/helm/feg-slot-games-fe/templates/route.yaml`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p infra/helm/feg-slot-games-fe/templates
```

- [ ] **Step 2: Create `Chart.yaml`**

```yaml
apiVersion: v2
name: feg-slot-games-fe
description: FEG Slot Games frontend deployment chart
type: application
version: 1.0.0
appVersion: "1.0.0"
```

- [ ] **Step 3: Create `values.yaml`**

```yaml
packName: feg-slot-games-fe

replicaCount: 1

image:
  repository: registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe
  tag: ""
  pullPolicy: Always

service:
  port: 8080

resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"

probes:
  readiness:
    path: /
    initialDelaySeconds: 5
    periodSeconds: 10
    timeoutSeconds: 3
    failureThreshold: 3
  liveness:
    path: /
    initialDelaySeconds: 10
    periodSeconds: 30
    timeoutSeconds: 3
    failureThreshold: 3
```

- [ ] **Step 4: Create `values-tst.yaml`**

```yaml
replicaCount: 1

resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "250m"
    memory: "256Mi"
```

- [ ] **Step 5: Create `values-stg.yaml`**

```yaml
replicaCount: 1
```

- [ ] **Step 6: Create `values-prod.yaml`**

```yaml
replicaCount: 2
```

- [ ] **Step 7: Create `templates/deployment.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.packName }}
  namespace: {{ .Release.Namespace }}
  labels:
    app: {{ .Values.packName }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.packName }}
  template:
    metadata:
      labels:
        app: {{ .Values.packName }}
    spec:
      containers:
        - name: {{ .Values.packName }}
          image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.service.port }}
              protocol: TCP
          resources:
            requests:
              cpu: {{ .Values.resources.requests.cpu | quote }}
              memory: {{ .Values.resources.requests.memory | quote }}
            limits:
              cpu: {{ .Values.resources.limits.cpu | quote }}
              memory: {{ .Values.resources.limits.memory | quote }}
          securityContext:
            runAsNonRoot: true
            allowPrivilegeEscalation: false
            capabilities:
              drop:
                - ALL
          readinessProbe:
            httpGet:
              path: {{ .Values.probes.readiness.path }}
              port: {{ .Values.service.port }}
            initialDelaySeconds: {{ .Values.probes.readiness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probes.readiness.periodSeconds }}
            timeoutSeconds: {{ .Values.probes.readiness.timeoutSeconds }}
            failureThreshold: {{ .Values.probes.readiness.failureThreshold }}
          livenessProbe:
            httpGet:
              path: {{ .Values.probes.liveness.path }}
              port: {{ .Values.service.port }}
            initialDelaySeconds: {{ .Values.probes.liveness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probes.liveness.periodSeconds }}
            timeoutSeconds: {{ .Values.probes.liveness.timeoutSeconds }}
            failureThreshold: {{ .Values.probes.liveness.failureThreshold }}
```

- [ ] **Step 8: Create `templates/service.yaml`**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.packName }}
  namespace: {{ .Release.Namespace }}
  labels:
    app: {{ .Values.packName }}
spec:
  selector:
    app: {{ .Values.packName }}
  ports:
    - name: http
      port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.port }}
      protocol: TCP
```

- [ ] **Step 9: Create `templates/route.yaml`**

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: {{ .Values.packName }}
  namespace: {{ .Release.Namespace }}
  labels:
    app: {{ .Values.packName }}
spec:
  to:
    kind: Service
    name: {{ .Values.packName }}
  port:
    targetPort: http
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
```

- [ ] **Step 10: Lint the chart**

```bash
helm lint infra/helm/feg-slot-games-fe/
```

Expected: `1 chart(s) linted, 0 chart(s) failed`

- [ ] **Step 11: Verify rendered templates**

```bash
helm template feg-slot-games-fe infra/helm/feg-slot-games-fe/ \
  -f infra/helm/feg-slot-games-fe/values-tst.yaml \
  --set image.tag=abc123def456-dev \
  --set packName=feg-slot-games-fe \
  --namespace gaming-studio-shared
```

Check output has: Deployment with 1 replica, Service on port 8080, Route with edge TLS, image `registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe:abc123def456-dev`.

---

## Task 4: Create sonar-project.properties

**Files:**
- Create: `sonar-project.properties`

- [ ] **Step 1: Create `sonar-project.properties`**

```properties
sonar.projectKey=feg-slot-games-fe
sonar.projectName=FEG Slot Games Frontend
sonar.sources=src
sonar.exclusions=node_modules/**,dist/**,feg_slot_build/**
```

`sonar.host.url` and auth token are injected by `withSonarQubeEnv('sonar-prod')` - not set here.
`sonar.projectKey` value `feg-slot-games-fe` must match the key infra team creates in SonarQube UI.

---

## Task 5: Create Jenkinsfile

**Files:**
- Create: `Jenkinsfile`

- [ ] **Step 1: Create `Jenkinsfile`**

```groovy
pipeline {
  agent {
    kubernetes {
      inheritFrom 'node22 buildah'
      defaultContainer 'node22'
    }
  }

  parameters {
    choice(
      name: 'DEPLOY_TARGET',
      choices: ['stg', 'prod'],
      description: 'Auto-set to stg on push to release/*. Manually re-trigger with prod to deploy PROD.'
    )
  }

  environment {
    QUAY_REGISTRY   = 'registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe'
    IMAGE_TAG       = "${GIT_COMMIT[0..11]}"
    BB_ASSETS_URL   = 'ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_assets.git'
    BB_SSH_URL      = 'ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_src.git'
    http_proxy      = 'http://10.0.68.20:3128'
    https_proxy     = 'http://10.0.68.20:3128'
    no_proxy        = 'nexus.svc.ifortuna.cz,registry.svc.ifortuna.cz,image-registry.openshift-image-registry.svc,*.svc.cluster.local,*.svc'
    GIT_SSH_COMMAND = 'ssh -o StrictHostKeyChecking=no'
  }

  stages {

    stage('Setup') {
      steps {
        withCredentials([string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN')]) {
          sh '''
            node --version
            npm --version
            NEXUS_HOST=$(echo "$NEXUS_URL" | sed 's|https://||;s|http://||')
            npm config set registry $NEXUS_URL/repository/npmjs_org/
            npm config set strict-ssl false
            npm config set //${NEXUS_HOST}/repository/npmjs_org/:_auth $NEXUS_TOKEN
            curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
            chmod 700 get_helm.sh
            VERIFY_CHECKSUM=false ./get_helm.sh
            git config --global --add safe.directory '*'
            git remote set-url origin $BB_SSH_URL
          '''
        }
      }
    }

    stage('Clone Assets') {
      steps {
        sshagent(credentials: ['jenkins-secret-bitbucket']) {
          sh 'git clone --depth 1 $BB_ASSETS_URL ../feg_games_assets'
        }
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('SonarQube') {
      steps {
        withSonarQubeEnv('sonar-prod') {
          sh "sonar-scanner -Dsonar.branch.name=${BRANCH_NAME}"
        }
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: false
        }
      }
    }

    // ── main: TST ──────────────────────────────────────────────────

    stage('Build TST') {
      when { branch 'main' }
      steps {
        sh 'BUILD_OUTPUT_ROOT="${WORKSPACE}/feg_slot_build" npm run build:development'
      }
    }

    stage('Push TST Image') {
      when { branch 'main' }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'quay-push-credentials',
            usernameVariable: 'QUAY_USER',
            passwordVariable: 'QUAY_PASS'
          )
        ]) {
          container('buildah') {
            sh '''
              buildah login --tls-verify=false \
                -u "$QUAY_USER" -p "$QUAY_PASS" \
                registry.svc.ifortuna.cz
              buildah login --tls-verify=false \
                -u serviceaccount \
                -p "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
                image-registry.openshift-image-registry.svc:5000
              buildah build-using-dockerfile \
                -f Dockerfile.ocp \
                --tls-verify=false \
                -t ${QUAY_REGISTRY}:${IMAGE_TAG}-dev .
              buildah push \
                --tls-verify=false \
                ${QUAY_REGISTRY}:${IMAGE_TAG}-dev
            '''
          }
        }
      }
    }

    stage('Deploy TST') {
      when { branch 'main' }
      steps {
        withVault(vaultSecrets: [[path: 'jenkins/gaming-studio', secretValues: [
          [$class: 'VaultSecretValue', envVar: 'K8S_CONFIG_BM', vaultKey: 'kubeconfig_bm']
        ]]]) {
          sh '''
            set +x
            dec="$(printf %s "$K8S_CONFIG_BM" | base64 -d 2>/dev/null || true)"
            if [ -n "${dec:-}" ] && printf %s "$dec" | grep -qE '^(apiVersion:|kind: Config|clusters:)'; then
              echo "$K8S_CONFIG_BM" | base64 -d > "$WORKSPACE/kubeconfig-tst"
            else
              echo "$K8S_CONFIG_BM" > "$WORKSPACE/kubeconfig-tst"
            fi
            chmod 600 "$WORKSPACE/kubeconfig-tst"
            set -x
            KUBECONFIG="$WORKSPACE/kubeconfig-tst" \
            HTTP_PROXY="" HTTPS_PROXY="" http_proxy="" https_proxy="" \
            helm upgrade --install feg-slot-games-fe ./infra/helm/feg-slot-games-fe \
              -f ./infra/helm/feg-slot-games-fe/values-tst.yaml \
              --set image.tag=${IMAGE_TAG}-dev \
              --set packName=feg-slot-games-fe \
              --namespace gaming-studio-shared
            rm -f "$WORKSPACE/kubeconfig-tst"
          '''
        }
        sshagent(credentials: ['jenkins-secret-bitbucket']) {
          sh '''
            git tag -f last-tst-deploy
            git push origin last-tst-deploy --force
          '''
        }
      }
    }

    // ── release/*: STG ────────────────────────────────────────────

    stage('Build STG') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'stg' }
        }
      }
      steps {
        sh 'BUILD_OUTPUT_ROOT="${WORKSPACE}/feg_slot_build" npm run build:staging'
      }
    }

    stage('Push STG Image') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'stg' }
        }
      }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'quay-push-credentials',
            usernameVariable: 'QUAY_USER',
            passwordVariable: 'QUAY_PASS'
          )
        ]) {
          container('buildah') {
            sh '''
              buildah login --tls-verify=false \
                -u "$QUAY_USER" -p "$QUAY_PASS" \
                registry.svc.ifortuna.cz
              buildah login --tls-verify=false \
                -u serviceaccount \
                -p "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
                image-registry.openshift-image-registry.svc:5000
              buildah build-using-dockerfile \
                -f Dockerfile.ocp \
                --tls-verify=false \
                -t ${QUAY_REGISTRY}:${IMAGE_TAG}-stg .
              buildah push \
                --tls-verify=false \
                ${QUAY_REGISTRY}:${IMAGE_TAG}-stg
            '''
          }
        }
      }
    }

    stage('Deploy STG') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'stg' }
        }
      }
      steps {
        withVault(vaultSecrets: [[path: 'jenkins/gaming-studio', secretValues: [
          [$class: 'VaultSecretValue', envVar: 'K8S_CONFIG_BM', vaultKey: 'kubeconfig_bm']
        ]]]) {
          sh '''
            set +x
            dec="$(printf %s "$K8S_CONFIG_BM" | base64 -d 2>/dev/null || true)"
            if [ -n "${dec:-}" ] && printf %s "$dec" | grep -qE '^(apiVersion:|kind: Config|clusters:)'; then
              echo "$K8S_CONFIG_BM" | base64 -d > "$WORKSPACE/kubeconfig-stg"
            else
              echo "$K8S_CONFIG_BM" > "$WORKSPACE/kubeconfig-stg"
            fi
            chmod 600 "$WORKSPACE/kubeconfig-stg"
            set -x
            KUBECONFIG="$WORKSPACE/kubeconfig-stg" \
            HTTP_PROXY="" HTTPS_PROXY="" http_proxy="" https_proxy="" \
            helm upgrade --install feg-slot-games-fe ./infra/helm/feg-slot-games-fe \
              -f ./infra/helm/feg-slot-games-fe/values-stg.yaml \
              --set image.tag=${IMAGE_TAG}-stg \
              --set packName=feg-slot-games-fe \
              --namespace gaming-studio-stg
            rm -f "$WORKSPACE/kubeconfig-stg"
          '''
        }
      }
    }

    // ── release/*: PROD ───────────────────────────────────────────

    stage('Build PROD') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'prod' }
        }
      }
      steps {
        sh 'BUILD_OUTPUT_ROOT="${WORKSPACE}/feg_slot_build" npm run build'
      }
    }

    stage('Push PROD Image') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'prod' }
        }
      }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'quay-push-credentials',
            usernameVariable: 'QUAY_USER',
            passwordVariable: 'QUAY_PASS'
          )
        ]) {
          container('buildah') {
            sh '''
              buildah login --tls-verify=false \
                -u "$QUAY_USER" -p "$QUAY_PASS" \
                registry.svc.ifortuna.cz
              buildah login --tls-verify=false \
                -u serviceaccount \
                -p "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
                image-registry.openshift-image-registry.svc:5000
              buildah build-using-dockerfile \
                -f Dockerfile.ocp \
                --tls-verify=false \
                -t ${QUAY_REGISTRY}:${IMAGE_TAG}-prod .
              buildah push \
                --tls-verify=false \
                ${QUAY_REGISTRY}:${IMAGE_TAG}-prod
            '''
          }
        }
      }
    }

    stage('Deploy PROD') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'prod' }
        }
      }
      steps {
        withVault(vaultSecrets: [[path: 'jenkins/gaming-studio', secretValues: [
          [$class: 'VaultSecretValue', envVar: 'K8S_CONFIG_BM', vaultKey: 'kubeconfig_bm']
        ]]]) {
          sh '''
            set +x
            dec="$(printf %s "$K8S_CONFIG_BM" | base64 -d 2>/dev/null || true)"
            if [ -n "${dec:-}" ] && printf %s "$dec" | grep -qE '^(apiVersion:|kind: Config|clusters:)'; then
              echo "$K8S_CONFIG_BM" | base64 -d > "$WORKSPACE/kubeconfig-prod"
            else
              echo "$K8S_CONFIG_BM" > "$WORKSPACE/kubeconfig-prod"
            fi
            chmod 600 "$WORKSPACE/kubeconfig-prod"
            set -x
            KUBECONFIG="$WORKSPACE/kubeconfig-prod" \
            HTTP_PROXY="" HTTPS_PROXY="" http_proxy="" https_proxy="" \
            helm upgrade --install feg-slot-games-fe ./infra/helm/feg-slot-games-fe \
              -f ./infra/helm/feg-slot-games-fe/values-prod.yaml \
              --set image.tag=${IMAGE_TAG}-prod \
              --set packName=feg-slot-games-fe \
              --namespace gaming-studio-prod
            rm -f "$WORKSPACE/kubeconfig-prod"
          '''
        }
        sshagent(credentials: ['jenkins-secret-bitbucket']) {
          sh '''
            git tag -f last-prod-deploy
            git push origin last-prod-deploy --force
          '''
        }
      }
    }

  }

  post {
    failure {
      echo "Pipeline failed on branch ${env.BRANCH_NAME} at commit ${env.GIT_COMMIT}"
    }
  }
}
```

**Note on STG/PROD kubeconfigs:** The Vault path `jenkins/gaming-studio` key `kubeconfig_bm` confirmed for TST. STG and PROD may use different Vault keys or the same kubeconfig with multiple contexts. If Deploy STG/PROD fails with a context error, ask infra team for STG/PROD Vault key names and update `vaultKey` accordingly in those stages.

**Note on buildah + OCP internal registry:** The `buildah login` using the service account token is standard for pods running in OCP to pull from the internal imagestream. If this fails with auth errors, ask infra team to grant `system:image-puller` role to the Jenkins service account on the `openshift` namespace.

---

## Task 6: OCP Pre-deploy Verification (Manual / Ops)

Run ONCE against TST cluster before first Jenkins pipeline run. No secrets needed - FE has no runtime credentials.

- [ ] **Step 1: Confirm pull secret exists in gaming-studio-shared**

```bash
oc get secret gaming-studio-pull-pull-secret -n gaming-studio-shared 2>/dev/null \
  || echo "Pull secret missing - ask infra to create it"
```

If missing, infra team creates a pull secret for `registry.svc.ifortuna.cz` and links it to the default service account.

- [ ] **Step 2: Verify nginx imagestream is accessible**

```bash
oc get istag nginx:1.26-ubi10 -n openshift -o jsonpath='{.image.dockerImageReference}'
```

Expected: returns a SHA-pinned image reference. This confirms the imagestream exists (already verified during design - `1.26-ubi10` confirmed present).

- [ ] **Step 3: Confirm Jenkins credentials exist**

In Jenkins UI, verify these credentials exist (already used by other services):

| Credential ID | Expected Type |
|---|---|
| `nexus-token` | Secret string |
| `quay-push-credentials` | Username/Password |
| `jenkins-secret-bitbucket` | SSH private key |

Vault path `jenkins/gaming-studio` key `kubeconfig_bm` - confirmed working (used by rgs_be and cms_be).

---

## Task 7: Jenkins Multibranch Pipeline Job Setup (Manual / Ops)

- [ ] **Step 1: Create multibranch pipeline job**

In Jenkins UI: GAMING_STUDIO folder > New Item > Multibranch Pipeline

Name: `feg-games-fe`

- [ ] **Step 2: Configure Branch Sources**

Branch Sources > Add > Bitbucket

- Credentials: `jenkins-secret-bitbucket`
- Repository SSH URL: `ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_src.git`

- [ ] **Step 3: Configure branch filter**

Behaviors > Filter by name (with wildcards):
- Include: `main release/* hotfix/*`
- Exclude: `feature/*`

- [ ] **Step 4: Configure Build Configuration**

Build Configuration > Mode: by Jenkinsfile

Script Path: `Jenkinsfile`

- [ ] **Step 5: Set default parameter value**

In the job configuration, set `DEPLOY_TARGET` default to `stg`. Jenkins multibranch pipelines pick up parameters from the Jenkinsfile `parameters {}` block after the first run. On auto-trigger (push), the default value `stg` applies automatically.

- [ ] **Step 6: Save and trigger first scan**

Click Save > Scan Multibranch Pipeline Now

Verify `main` branch is detected and a build starts.

- [ ] **Step 7: Verify first build**

Monitor the `main` branch build. Expected stages to complete:
1. Setup - npm Nexus config + Helm install
2. Clone Assets - `feg_games_assets` cloned successfully
3. Install - `npm ci` completes
4. SonarQube - scan passes
5. Build TST - all 5 games built (`empireofgold`, `royale81`, `empireofgoldnewconquest`, `sweetsalon`, `frostedmarketbonanza`)
6. Push TST Image - image `${SHA}-dev` pushed to Quay
7. Deploy TST - Helm release `feg-slot-games-fe` deployed to `gaming-studio-shared`

- [ ] **Step 8: Verify deployment on OCP TST**

```bash
oc get deployment feg-slot-games-fe -n gaming-studio-shared
oc get route feg-slot-games-fe -n gaming-studio-shared
```

Expected: Deployment `1/1 Ready`, Route URL present.

- [ ] **Step 9: Smoke test the deployed app**

```bash
ROUTE=$(oc get route feg-slot-games-fe -n gaming-studio-shared \
  -o jsonpath='{.spec.host}')
curl -sk -o /dev/null -w "%{http_code}" https://${ROUTE}/
```

Expected: `200` or `301` (redirect to game subdirectory).

```bash
curl -sk -o /dev/null -w "%{http_code}" https://${ROUTE}/royale81/
```

Expected: `200`

---

## Known Issues to Watch (from rgs_be/cms_be experience)

These are issues hit during first builds of other services. Pre-empted here but worth watching:

1. **Helm download via proxy**: `get-helm-4` script downloads from `github.com`. Goes through `http_proxy`. If it fails with TLS errors, use `curl -k` flag or ask infra to whitelist `github.com` in proxy.

2. **buildah OCP imagestream auth**: `buildah login` using service account token is standard for OCP. If it fails, infra grants `system:image-puller` to Jenkins service account on `openshift` namespace via: `oc adm policy add-role-to-user system:image-puller system:serviceaccount:<jenkins-namespace>:<jenkins-sa> -n openshift`

3. **`npm ci` Nexus SSL**: `.npmrc` has `strict-ssl=false`. If `npm ci` still fails with SSL errors, verify the Nexus URL in `package-lock.json` matches `nexus.svc.ifortuna.cz` (Task 0 prerequisite).

4. **STG/PROD kubeconfig keys**: Vault key `kubeconfig_bm` confirmed for TST. If STG/PROD deploys fail with kubeconfig errors, ask infra for correct Vault key names for STG/PROD clusters and update the `vaultKey` values in Deploy STG and Deploy PROD stages.

5. **`feg_slot_build/` path in buildah context**: buildah build context is the repo root (`${WORKSPACE}`). `feg_slot_build/` is created inside workspace by the build step. If buildah runs from a different working directory, the COPY in Dockerfile.ocp will fail. Ensure `buildah build-using-dockerfile` is run from `${WORKSPACE}`.
