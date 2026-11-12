
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/5 * * * *')
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
                bat 'npm --prefix backend test'
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
            echo 'HostelCare CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check the console output.'
        }

        always {
            echo 'HostelCare pipeline execution finished.'
        }
    }
}
