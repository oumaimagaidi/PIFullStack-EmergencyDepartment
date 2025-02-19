pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token') // Replace 'sonar-token' with your Jenkins credential ID
    }

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
                    sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.login=$squ_15e2556c809394546921c16f0b9b2ec1647d38b2
                    """
                } 
            } 
        }
    }
}
