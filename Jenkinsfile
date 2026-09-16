// Runs on a Jenkins agent that lives on the deploy host and can use Docker
// (Docker Engine 25+ with the compose plugin). See docs/DEPLOY.md.
pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 20, unit: 'MINUTES')
  }

  triggers {
    // Requires the GitHub plugin and a webhook to <jenkins-url>/github-webhook/.
    githubPush()
  }

  environment {
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Check tooling') {
      steps {
        sh 'docker version --format "Docker {{.Server.Version}}"'
        sh 'docker compose version'
      }
    }

    stage('Test and build image') {
      steps {
        // npm test and vite build run inside the Dockerfile build stage; a failing test stops here
        // and the running container is left untouched.
        sh 'docker compose build --pull'
      }
    }

    stage('Deploy') {
      steps {
        sh 'sh deploy/deploy.sh "$IMAGE_TAG"'
      }
    }
  }

  post {
    success {
      echo "vehicle-viewer:${env.IMAGE_TAG} is serving on 127.0.0.1:6666"
    }
    failure {
      sh 'docker ps --filter name=vehicle-viewer --format "{{.Names}} {{.Image}} {{.Status}}" || true'
    }
  }
}
