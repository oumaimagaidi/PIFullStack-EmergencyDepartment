pipeline {
    agent any

    environment {
        registryCredentials = "nexus"
        registry = "localhost:8083"
    }

    stages {
        stage('Teardown & Clean') {
      steps {
        echo 'Stopping existing Docker Compose services and cleaning data…'
        sh 'docker-compose down'
        sh 'rm -rf data'
      }
    }

    stage('Start Nexus & Sonar') {
      steps {
        echo 'Starting Nexus and Sonar services…'
        sh 'docker start nexus sonar'
      }
    }
        stage('Install Dependencies') {
            steps {
                script {
                    // Install backend dependencies
                    dir('backend') {
                        sh 'npm install --legacy-peer-deps'
                    }

                    // Install frontend dependencies
                    dir('frontend') {
                        sh 'npm install --legacy-peer-deps && npm install @testing-library/dom --save-dev --legacy-peer-deps'
                    }
                }
            }
        }

        stage('Run Unit Tests') {
            steps {
                script {
                    // Run backend unit tests
                    dir('backend') {
                        // sh 'npm test'
                    }

                    // Run frontend unit tests
                    dir('frontend') {
                        sh 'npm run test'
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                script {
                    // Build the backend (optional, depending on your project)
                    dir('backend') {
                        // sh 'npm run build'
                    }

                    // Build the frontend
                    dir('frontend') {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Building images (node and mongo)') {
            steps {
                script {
                    sh('DOCKER_BUILDKIT=0 docker-compose build')
                }
            }
        }

        stage('Deploy to Nexus') { 
            steps {   
                script { 
                    docker.withRegistry("http://"+registry, registryCredentials) { 
                        sh('docker push $registry/nodemongoapp:5.0') 
                    } 
                } 
            } 
        }

        stage('SonarQube Analysis') {
            steps {
                script { 
                    sh 'node -v'
                    def scannerHome = tool 'scanner'
                    withSonarQubeEnv {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                } 
            } 
        }

        stage('Run application') { 
            steps {   
                script { 
                    docker.withRegistry("http://"+registry, registryCredentials) { 
                        sh('docker pull ${registry}/nodemongoapp:5.0') 
                        sh('docker-compose up -d') 
                    } 
                } 
            } 
        }
    }
}
