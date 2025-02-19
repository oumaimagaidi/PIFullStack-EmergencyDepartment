pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    // Install backend dependencies
                    dir('backend') {
                        sh 'npm install'
                    }

                    // Install frontend dependencies
                    dir('frontend') {
                        sh 'npm install --legacy-peer-deps'
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
                        // sh 'npm test'
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

        stage('SonarQube Analysis') {
            steps {
                script { 
                    def scannerHome = tool 'scanner'
                   withSonarQubeEnv {
                        sh "${scannerHome}/bin/sonar-scanner"
                        }
                } 
            } 
        }
    }
}
