
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        NODE_ENV = 'test'
        PORT = '5000'
        JWT_EXPIRES_IN = '7d'
        CLIENT_URL = 'http://localhost:5173'
        ADMIN_NAME = 'Hostel Warden'
        ADMIN_EMAIL = 'admin@example.com'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out HostelCare source code'
                checkout scm
            }
        }

        stage('Environment Check') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'git --version'
            }
        }

        stage('MongoDB Connection Check') {
            steps {
                bat '''
                powershell -NoProfile -Command "if (Test-NetConnection 127.0.0.1 -Port 27017 -InformationLevel Quiet) { Write-Host 'MongoDB port is reachable' } else { Write-Error 'MongoDB is not reachable on port 27017'; exit 1 }"
                '''
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                bat 'npm --prefix backend ci'
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                bat 'npm --prefix frontend ci'
            }
        }

        stage('Backend Tests') {
            steps {
                withCredentials([
                    string(credentialsId: 'hostelcare-jwt-secret',
                           variable: 'JWT_SECRET'),
                    string(credentialsId: 'hostelcare-mongo-uri',
                           variable: 'MONGO_URI')
                ]) {
                    bat 'npm --prefix backend test'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                bat 'npm --prefix frontend test'
            }
        }

        stage('Frontend Production Build') {
            steps {
                bat 'npm --prefix frontend run build'
            }
        }
    }

    post {
        success {
            echo 'HostelCare CI pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }

        always {
            echo 'HostelCare pipeline execution finished.'
        }
    }
}
