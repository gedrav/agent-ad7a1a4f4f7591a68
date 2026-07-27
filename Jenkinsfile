def notify = null

pipeline {
  agent {
    kubernetes {
      inheritFrom 'node22 buildah'
      defaultContainer 'node22'
    }
  }

  options {
    disableConcurrentBuilds()
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

    stage('Validate') {
      steps {
        script {
          if (env.BRANCH_NAME ==~ /hotfix\/.*/) {
            sshagent(credentials: ['jenkins-secret-bitbucket']) {
              sh 'git fetch --depth=100 origin "+refs/tags/last-prod-deploy:refs/tags/last-prod-deploy"'
            }
            def prodCommit = sh(script: 'git rev-parse last-prod-deploy', returnStdout: true).trim()
            def branchBase  = sh(script: "git merge-base HEAD ${prodCommit}", returnStdout: true).trim()
            if (branchBase != prodCommit) {
              error("Hotfix branch must be created from last-prod-deploy tag (${prodCommit.take(12)}). Branch diverged from: ${branchBase.take(12)}")
            }
            echo "Hotfix base verified: branched from last-prod-deploy (${prodCommit.take(12)})"
          }
        }
      }
    }

    stage('Load Config') {
      steps {
        configFileProvider([
          configFile(fileId: 'gaming-studio-global-env', variable: 'PROPS_FILE'),
          configFile(fileId: 'gaming-studio-notify',     variable: 'NOTIFY_SCRIPT')
        ]) {
          script {
            def props         = readProperties file: env.PROPS_FILE
            env.QUAY_REGISTRY = "${props.QUAY_REGISTRY_BASE}/feg-slot-games-fe"
            env.http_proxy    = props.PROXY_URL
            env.https_proxy   = props.PROXY_URL
            env.no_proxy      = props.NO_PROXY_LIST
            env.BB_SSH_URL    = "${props.BB_BASE_SSH_URL}/feg_games_src.git"
            notify            = load(env.NOTIFY_SCRIPT)
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
                -t ${QUAY_REGISTRY}:${IMAGE_TAG}-tst .
              buildah push \
                --tls-verify=false \
                ${QUAY_REGISTRY}:${IMAGE_TAG}-tst
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
              --set image.tag=${IMAGE_TAG}-tst \
              --set packName=feg-slot-games-fe \
              --kube-context 'gaming-studio-shared/tst-ocp4-bm' \
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
      post {
        success {
          script {
            notify.teams('teams-webhook-nonprod', 'Deployed', 'good', 'TST', "${env.IMAGE_TAG}-tst")
          }
        }
        failure {
          script {
            currentBuild.description = 'teams-notified'
            notify.teams('teams-webhook-nonprod', 'Deploy Failed', 'attention', 'TST', "${env.IMAGE_TAG}-tst")
          }
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
              --kube-context 'gaming-studio-shared/stg-ocp4-bm' \
              --namespace gaming-studio-shared
            rm -f "$WORKSPACE/kubeconfig-stg"
          '''
        }
        sshagent(credentials: ['jenkins-secret-bitbucket']) {
          sh '''
            git tag -f last-stg-deploy
            git push origin last-stg-deploy --force
          '''
        }
      }
      post {
        success {
          script {
            notify.teams('teams-webhook-nonprod', 'Deployed', 'good', 'STG', "${env.IMAGE_TAG}-stg")
            notify.shipiq('feg_games_src', 'SUCCESS')
          }
        }
        failure {
          script {
            currentBuild.description = 'teams-notified'
            notify.teams('teams-webhook-nonprod', 'Deploy Failed', 'attention', 'STG', "${env.IMAGE_TAG}-stg")
            notify.shipiq('feg_games_src', 'FAILURE')
          }
        }
      }
    }

    // ── release/*: PROD ───────────────────────────────────────────

    stage('Build PROD') {
      when {
        anyOf {
          allOf {
            branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
            expression { params.DEPLOY_TARGET == 'prod' }
          }
          tag pattern: 'prod-deploy/.*', comparator: 'REGEXP'
        }
      }
      steps {
        sh 'BUILD_OUTPUT_ROOT="${WORKSPACE}/feg_slot_build" npm run build'
      }
    }

    stage('Push PROD Image') {
      when {
        anyOf {
          allOf {
            branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
            expression { params.DEPLOY_TARGET == 'prod' }
          }
          tag pattern: 'prod-deploy/.*', comparator: 'REGEXP'
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
        anyOf {
          allOf {
            branch pattern: 'release/.*|hotfix/.*', comparator: 'REGEXP'
            expression { params.DEPLOY_TARGET == 'prod' }
          }
          tag pattern: 'prod-deploy/.*', comparator: 'REGEXP'
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
              --kube-context 'gaming-studio-shared/sharedprd-ocp4-bm' \
              --namespace gaming-studio-shared
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
      post {
        success {
          script {
            notify.teams('teams-webhook-prod', 'Deployed', 'good', 'PROD', "${env.IMAGE_TAG}-prod")
            notify.shipiq('feg_games_src', 'SUCCESS')
          }
        }
        failure {
          script {
            currentBuild.description = 'teams-notified'
            notify.teams('teams-webhook-prod', 'Deploy Failed', 'attention', 'PROD', "${env.IMAGE_TAG}-prod")
            notify.shipiq('feg_games_src', 'FAILURE')
          }
        }
        always {
          script {
            if (env.TAG_NAME?.startsWith('prod-deploy/')) {
              sshagent(credentials: ['jenkins-secret-bitbucket']) {
                sh 'git push origin :refs/tags/${TAG_NAME} || true'
              }
            }
          }
        }
      }
    }

  }

  post {
    failure {
      script {
        if (currentBuild.description != 'teams-notified') {
          notify?.teams('teams-webhook-nonprod', 'Pipeline Failed', 'attention', 'Build')
        }
      }
    }
  }
}
