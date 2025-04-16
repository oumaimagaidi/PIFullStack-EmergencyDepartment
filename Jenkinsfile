pipeline {
    agent any

    environment {
        registryCredentials = "nexus"
        registry = "192.168.252.114:8083"
        backendImage = "${registry}/nodemongoapp-backend:5.0"
        frontendImage = "${registry}/nodemongoapp-frontend:5.0"
    }

    stages {
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Run Unit Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            // Uncomment if you have tests for backend
                            // sh 'npm test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm run test'
                        }
                    }
                }
            }
        }

        stage('Build Application') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            // Uncomment if a build step is necessary
                            // sh 'npm run build'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            sh 'docker build -t ${backendImage} .'
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            sh 'docker build -t ${frontendImage} .'
                        }
                    }
                }
            }
        }

        stage('Deploy to Nexus') { 
            steps {   
                script { 
                    docker.withRegistry("http://"+registry, registryCredentials) {
                        sh 'docker push ${backendImage}'
                        sh 'docker push ${frontendImage}'
                    }
                } 
            } 
        }

        stage('SonarQube Analysis') {
            steps {
                script { 
                    // Run SonarScanner (this can be adjusted if needed to only cover specific sources)
                    def scannerHome = tool 'scanner'
                    withSonarQubeEnv {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                } 
            } 
        }

        stage('Run Application') { 
            steps {   
                script { 
                    docker.withRegistry("http://"+registry, registryCredentials) { 
                        sh 'docker pull ${backendImage}'
                        sh 'docker pull ${frontendImage}'
                    }
                    // You can update your docker-compose file accordingly to run both images
                    sh 'docker-compose up -d'
                } 
            } 
        }
    }
}
