# Games Frontend OCP CI/CD Design

**Date:** 2026-06-07
**Status:** Approved
**Scope:** Jenkins CI/CD pipeline and OCP deployment for `feg_games_src` (static game frontend)

---

## Context

Game frontend is a Vite-based static site (HTML + JS + CSS + assets). No Node.js runtime at serve time. Currently deployed to Azure Blob Storage via Bitbucket Pipelines. This design establishes OCP deployment in parallel, following the same Jenkins + Quay + Helm pattern used by all FEG backend services.

**Constraints:**
- FEG mandates Jenkins + Bitbucket for CI/CD
- SonarQube scan mandatory in every pipeline
- 3 OCP clusters: TST, STG, PROD
- Quay registry: `registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe` (already created)
- `feg_games_assets` is a separate repo on FEG Bitbucket - must be cloned during build
- Vite bakes env vars (`VITE_API_URL` etc.) at build time - separate builds per environment required
- Azure + Bitbucket Pipelines continues in parallel (not replaced)
- OCP infra team will deploy their own ingress solution on top of our Service/Route for external player access

**Key difference from backends:** Vite bakes API URLs into the JS bundle at build time. TST/STG/PROD require different builds (not "build once, promote same image"). This drives the multi-image-per-release approach.

---

## Architecture

### Flow

```
push to FEG Bitbucket (feg_games_src)
        | webhook
        v
Jenkins: Jenkinsfile (multibranch pipeline)
        |
        |- [1] Setup: npm Nexus config, Helm install, git safe.directory
        |- [2] Clone feg_games_assets (SSH, FEG Bitbucket, sibling path ../feg_games_assets)
        |- [3] npm ci (Nexus registry)
        |- [4] SonarQube scan
        |
        |- [main]     build --mode development -> image ${SHA}-dev -> deploy TST
        |- [release/*] push: build --mode staging  -> image ${SHA}-stg -> deploy STG (auto)
        |              manual re-trigger DEPLOY_TARGET=prod:
        |              build --mode production -> image ${SHA}-prod -> deploy PROD
        |
Quay:   registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe
OCP:    nginx pod in gaming-studio-shared namespace
        Route: feg-slot-games-fe-gaming-studio-shared.apps.ocp02-shared.t.dc1.cz.ipa.ifortuna.cz
```

### Build Strategy

| Branch | Trigger | Vite mode | Image tag | Deploys to |
|--------|---------|-----------|-----------|------------|
| `main` | push | `development` | `${SHA}-dev` | TST (auto) |
| `release/*` | push | `staging` | `${SHA}-stg` | STG (auto) |
| `release/*` | manual `DEPLOY_TARGET=prod` | `production` | `${SHA}-prod` | PROD (manual) |

PROD deploy is a manual re-trigger of the same `release/*` branch pipeline with `DEPLOY_TARGET=prod`. No long-running input gate - STG testing can take days without holding a Jenkins executor.

### Runtime

Static files served by nginx `1.26-ubi10` (OCP image stream). No Node.js runtime. No backend secrets at serve time.

---

## Branching Model

Same model as all FEG backend services:

| Branch | Lifetime | Maps to |
|--------|----------|---------|
| `main` | Permanent trunk | TST |
| `release/vYYYY.MM[.patch]` | Short-lived (days-week) | STG + PROD |
| `hotfix/<description>` | Short-lived | STG + PROD |
| `feature/*` | Short-lived | none (PR to main) |

Git tags:
- `last-tst-deploy` - updated after every TST deploy from `main`
- `last-prod-deploy` - updated after every PROD deploy from `release/*`

---

## Image Tagging Strategy

| Tag | Example | When |
|-----|---------|------|
| `${SHA}-dev` | `a1b2c3d4e5f6-dev` | TST build from `main` |
| `${SHA}-stg` | `a1b2c3d4e5f6-stg` | STG build from `release/*` |
| `${SHA}-prod` | `a1b2c3d4e5f6-prod` | PROD build from `release/*` manual trigger |

SHA = first 12 chars of `GIT_COMMIT`. Immutable - same SHA, different suffix = different build (different Vite env baked in).

---

## Dockerfile.ocp

Build happens in Jenkins workspace. Dockerfile only packages the output into nginx.

```dockerfile
FROM image-registry.openshift-image-registry.svc:5000/openshift/nginx:1.26-ubi10

COPY feg_slot_build/ /usr/share/nginx/html/
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
```

UBI nginx image pre-configured for OCP: runs as user 1001 (non-root), listens on port 8080, pid/temp paths already set correctly for non-root. Only the server block (`conf.d/default.conf`) is overridden.

`feg_slot_build/` is the Jenkins workspace-local build output (`BUILD_OUTPUT_ROOT=${WORKSPACE}/feg_slot_build`).

---

## nginx Server Config (`infra/nginx/default.conf`)

Translates `staticwebapp.config.json` rules into nginx equivalents.

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;

    # Security headers (mirrors staticwebapp.config.json globalHeaders)
    add_header X-Content-Type-Options  "nosniff" always;
    add_header X-Frame-Options         "SAMEORIGIN" always;
    add_header Referrer-Policy         "strict-origin-when-cross-origin" always;

    # Serve pre-compressed .gz files automatically (vite generates .gz alongside originals)
    gzip_static on;

    # Immutable hashed assets (JS, CSS, fonts)
    location ~* \.(js|css|woff2?|ttf)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Game assets (sounds, spines, images)
    location ~* \.(mp3|ogg|wav|atlas|skel|png|jpg|webp|svg|ico)$ {
        add_header Cache-Control "public, max-age=86400";
    }

    # Runtime config - never cache
    location = /assets/env/commonConfig.json {
        add_header Cache-Control "no-store, no-cache";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

**Brotli note:** Vite also generates `.br` files (`vite-plugin-compression2`). UBI nginx does not include `ngx_brotli` module (third-party, not in standard RHEL packages). `.br` files will be present in the image but not auto-negotiated. `gzip_static on` covers all browsers. Brotli can be added later by building a custom nginx image with the module.

---

## Helm Chart

Single chart at `infra/helm/feg-slot-games-fe/`. No Secret (no runtime credentials). Port 8080. OCP Route with edge TLS - same pattern as all other services.

### values.yaml

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

### values-tst.yaml

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

### values-stg.yaml

```yaml
replicaCount: 1
```

### values-prod.yaml

```yaml
replicaCount: 2
```

### Templates

- `deployment.yaml` - standard OCP deployment, non-root securityContext, readiness + liveness probes, no envFrom (no ConfigMap/Secret needed)
- `service.yaml` - ClusterIP on port 8080
- `route.yaml` - OCP Route, edge TLS termination, Redirect insecure traffic

---

## Jenkinsfile Structure

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
      description: 'Auto-set to stg on push. Manually set to prod for PROD deploy.'
    )
  }

  environment {
    QUAY_REGISTRY  = 'registry.svc.ifortuna.cz/gaming-studio/feg-slot-games-fe'
    IMAGE_TAG      = "${GIT_COMMIT[0..11]}"
    BB_ASSETS_URL  = 'ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_assets.git'
    BB_SSH_URL     = 'ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_src.git'
    http_proxy     = 'http://10.0.68.20:3128'
    https_proxy    = 'http://10.0.68.20:3128'
    no_proxy       = 'nexus.svc.ifortuna.cz,registry.svc.ifortuna.cz,image-registry.openshift-image-registry.svc,*.svc.cluster.local,*.svc'
    GIT_SSH_COMMAND = 'ssh -o StrictHostKeyChecking=no'
  }

  stages {

    stage('Setup') { ... }
    // npm Nexus config, Helm install, git safe.directory, git remote set-url to BB SSH

    stage('Clone Assets') { ... }
    // sshagent(['jenkins-secret-bitbucket'])
    // git clone --depth 1 BB_ASSETS_URL ../feg_games_assets

    stage('Install') { ... }
    // npm ci

    stage('SonarQube') { ... }
    // withSonarQubeEnv('sonar-prod') { sh "sonar-scanner -Dsonar.branch.name=${BRANCH_NAME}" }
    // waitForQualityGate abortPipeline: false

    // --- main: TST ---

    stage('Build TST') {
      when { branch 'main' }
      // BUILD_OUTPUT_ROOT="${WORKSPACE}/feg_slot_build" npm run build:development
    }

    stage('Push TST Image') {
      when { branch 'main' }
      // buildah build Dockerfile.ocp -t ${QUAY_REGISTRY}:${IMAGE_TAG}-dev
      // buildah push ${QUAY_REGISTRY}:${IMAGE_TAG}-dev
    }

    stage('Deploy TST') {
      when { branch 'main' }
      // helm upgrade --install feg-slot-games-fe ./infra/helm/feg-slot-games-fe
      //   -f values-tst.yaml --set image.tag=${IMAGE_TAG}-dev --namespace gaming-studio-shared
      // sshagent: git tag -f last-tst-deploy && git push origin last-tst-deploy --force
    }

    // --- release/*: STG ---

    stage('Build STG') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'stg' }
        }
      }
      // BUILD_OUTPUT_ROOT="${WORKSPACE}/feg_slot_build" npm run build:staging
    }

    stage('Push STG Image') {
      when { ... same conditions ... }
      // buildah build -t ${QUAY_REGISTRY}:${IMAGE_TAG}-stg
      // buildah push
    }

    stage('Deploy STG') {
      when { ... same conditions ... }
      // helm upgrade --install ... -f values-stg.yaml --set image.tag=${IMAGE_TAG}-stg
      //   --namespace gaming-studio-stg
    }

    // --- release/*: PROD (manual re-trigger with DEPLOY_TARGET=prod) ---

    stage('Build PROD') {
      when {
        allOf {
          branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
          expression { params.DEPLOY_TARGET == 'prod' }
        }
      }
      // BUILD_OUTPUT_ROOT="${WORKSPACE}/feg_slot_build" npm run build
    }

    stage('Push PROD Image') {
      when { ... same conditions ... }
      // buildah build -t ${QUAY_REGISTRY}:${IMAGE_TAG}-prod
      // buildah push
    }

    stage('Deploy PROD') {
      when { ... same conditions ... }
      // helm upgrade --install ... -f values-prod.yaml --set image.tag=${IMAGE_TAG}-prod
      //   --namespace gaming-studio-prod
      // sshagent: git tag -f last-prod-deploy && git push origin last-prod-deploy --force
    }

  }

  post {
    failure {
      echo "Pipeline failed on branch ${env.BRANCH_NAME} commit ${env.GIT_COMMIT}"
    }
  }
}
```

---

## Jenkins Credentials Required

| Credential ID | Type | Purpose |
|---|---|---|
| `nexus-token` | Secret string | npm Nexus auth (same as rgs_be) |
| `quay-push-credentials` | Username/Password | buildah push to Quay |
| `jenkins-secret-bitbucket` | SSH private key | clone `feg_games_src` + `feg_games_assets` |
| Vault `jenkins/gaming-studio` key `kubeconfig_bm` | Vault secret | TST cluster kubeconfig |

All credentials already exist from previous service deployments. No new credentials needed.

---

## File Structure

```
feg_games_src/
├── .npmrc                                  # Nexus registry URLs (no auth token)
├── Dockerfile.ocp                          # nginx image packaging
├── Jenkinsfile                             # single multibranch pipeline
├── sonar-project.properties                # SonarQube project config
├── bitbucket-pipelines.yml                 # existing Azure pipeline - unchanged
│
└── infra/
    ├── nginx/
    │   └── default.conf                    # nginx server block (port 8080, cache headers)
    └── helm/
        └── feg-slot-games-fe/
            ├── Chart.yaml
            ├── values.yaml
            ├── values-tst.yaml
            ├── values-stg.yaml
            ├── values-prod.yaml
            └── templates/
                ├── deployment.yaml
                ├── service.yaml
                └── route.yaml
```

---

## Task 0: Pre-work - Switch npm registry to Nexus Locally

Runs locally BEFORE implementing other tasks. Ensures `package-lock.json` has Nexus URLs so `npm ci` works inside Jenkins (which points npm at Nexus).

**Why needed:** `npm ci` fetches packages from URLs baked into `package-lock.json`. Current lock file has `registry.npmjs.org` URLs. Jenkins npm is configured to use Nexus - the URL mismatch causes `npm ci` to fail or attempt to reach the public internet (blocked by FEG proxy).

**No `@pixentech` private packages in this repo** (unlike rgs_be/cms_be) - only public npm packages. So no private registry auth needed in `.npmrc`.

**Files to change:**
- Create: `.npmrc`
- Regenerate: `package-lock.json`

### Step 1: Create `.npmrc` at repo root

```
registry=https://nexus.svc.ifortuna.cz/repository/npmjs_org/
strict-ssl=false
```

No auth token - committed file must not contain credentials. Jenkins injects auth via `nexus-token` credential in Setup stage.

### Step 2: Regenerate `package-lock.json` against Nexus

Must have local Nexus access configured (add `_auth` to your personal `~/.npmrc` - do NOT commit this):

```bash
rm -rf package-lock.json node_modules
npm install
```

Verify `package-lock.json` now references `nexus.svc.ifortuna.cz` URLs instead of `registry.npmjs.org`.

---

## OCP Pre-deploy Setup (Manual / Ops)

These run ONCE before first Jenkins deploy. No secrets needed (FE has no runtime credentials).

- [ ] Confirm `gaming-studio-pull-pull-secret` (or equivalent) pull secret exists in `gaming-studio-shared` namespace for pulling from `registry.svc.ifortuna.cz`
- [ ] Confirm `image-registry.openshift-image-registry.svc:5000/openshift/nginx:1.26-ubi10` is accessible from buildah pod (in-cluster, no auth needed for openshift namespace imagestreams)
- [ ] STG + PROD namespaces and kubeconfigs from infra team (same as other services - likely already available)

---

## Jenkins Job Configuration

Jenkins multibranch pipeline in GAMING_STUDIO folder:
- Scan branches: `main`, `release/*`, `hotfix/*`
- Ignore: `feature/*`
- Bitbucket webhook triggers on push
- Script path: `Jenkinsfile`
- Default parameter `DEPLOY_TARGET=stg` (Jenkins sets this on auto-trigger; operator overrides to `prod` for PROD deploy)

---

## Rollback

Re-run any previous Jenkins build with `DEPLOY_TARGET=prod` and the correct `release/*` branch, overriding `image.tag` to a previous SHA:

```bash
helm upgrade --install feg-slot-games-fe ./infra/helm/feg-slot-games-fe \
  -f ./infra/helm/feg-slot-games-fe/values-prod.yaml \
  --set image.tag=<previous-sha>-prod \
  --set packName=feg-slot-games-fe \
  --namespace gaming-studio-prod \
  --kubeconfig <prod-kubeconfig>
```

Keep minimum 10 tags per image variant in Quay.

---

## Prerequisites (Blocked on FEG Infra)

- [ ] `feg_games_src` + `feg_games_assets` repos mirrored to FEG Bitbucket (`gs/` project)
- [ ] Jenkins multibranch pipeline job created in GAMING_STUDIO folder
- [ ] SonarQube project key + `FEG-SonarQube` Jenkins plugin configured
- [ ] STG + PROD cluster kubeconfigs available in Vault `jenkins/gaming-studio` (confirmed present - used by rgs_be and cms_be deployments)
- [ ] Jenkins agent label confirmed (`node22 buildah` - same as rgs_be)
- [ ] Quay repo `feg-slot-games-fe` already created (confirmed)
- [ ] Infra team ingress solution deployment (separate, handled by infra)
