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
    IMAGE_TAG       = "${GIT_COMMIT[0..11]}"
    BB_ASSETS_URL   = 'ssh://git@app-bitb-shared.o.dc1.cz.ipa.ifortuna.cz:7999/gs/feg_games_assets.git'
    GIT_SSH_COMMAND = 'ssh -o StrictHostKeyChecking=no'
    PATH            = "$HOME/.local/bin:$PATH"
  }

  stages {

    stage('Load Config') {
      steps {
        configFileProvider([configFile(fileId: 'gaming-studio-global-env', variable: 'PROPS_FILE')]) {
          script {
            def props         = readProperties file: env.PROPS_FILE
            env.QUAY_REGISTRY = "${props.QUAY_REGISTRY_BASE}/feg-slot-games-fe"
            env.http_proxy    = props.PROXY_URL
            env.https_proxy   = props.PROXY_URL
            env.no_proxy      = props.NO_PROXY_LIST
            env.BB_SSH_URL    = "${props.BB_BASE_SSH_URL}/feg_games_src.git"
          }
        }
      }
    }

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
            mkdir -p "$HOME/.local/bin"
            curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4
            chmod 700 get_helm.sh
            VERIFY_CHECKSUM=false USE_SUDO=false HELM_INSTALL_DIR="$HOME/.local/bin" ./get_helm.sh
            helm version
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
        withVault(vaultSecrets: [[path: 'jenkins/gaming-studio', secretValues: [
          [$class: 'VaultSecretValue', envVar: 'DOCKER_CONFIG_B64', vaultKey: 'docker-config']
        ]]]) {
          container('buildah') {
            sh '''
              mkdir -p ~/.docker
              echo "$DOCKER_CONFIG_B64" | base64 -d > ~/.docker/config.json
              buildah build-using-dockerfile \
                -f Dockerfile.ocp \
                --tls-verify=false \
                -t ${QUAY_REGISTRY}:${IMAGE_TAG}-dev .
              buildah push \
                --tls-verify=false \
                ${QUAY_REGISTRY}:${IMAGE_TAG}-dev
              rm -f ~/.docker/config.json
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
        withVault(vaultSecrets: [[path: 'jenkins/gaming-studio', secretValues: [
          [$class: 'VaultSecretValue', envVar: 'DOCKER_CONFIG_B64', vaultKey: 'docker-config']
        ]]]) {
          container('buildah') {
            sh '''
              mkdir -p ~/.docker
              echo "$DOCKER_CONFIG_B64" | base64 -d > ~/.docker/config.json
              buildah build-using-dockerfile \
                -f Dockerfile.ocp \
                --tls-verify=false \
                -t ${QUAY_REGISTRY}:${IMAGE_TAG}-stg .
              buildah push \
                --tls-verify=false \
                ${QUAY_REGISTRY}:${IMAGE_TAG}-stg
              rm -f ~/.docker/config.json
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
        withVault(vaultSecrets: [[path: 'jenkins/gaming-studio', secretValues: [
          [$class: 'VaultSecretValue', envVar: 'DOCKER_CONFIG_B64', vaultKey: 'docker-config']
        ]]]) {
          container('buildah') {
            sh '''
              mkdir -p ~/.docker
              echo "$DOCKER_CONFIG_B64" | base64 -d > ~/.docker/config.json
              buildah build-using-dockerfile \
                -f Dockerfile.ocp \
                --tls-verify=false \
                -t ${QUAY_REGISTRY}:${IMAGE_TAG}-prod .
              buildah push \
                --tls-verify=false \
                ${QUAY_REGISTRY}:${IMAGE_TAG}-prod
              rm -f ~/.docker/config.json
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
