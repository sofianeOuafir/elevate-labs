# Game Event Tracking API

## Table of Contents
- [Introduction](#introduction)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
  - [Development](#development)
  - [Production](#production)
- [Running Tests](#running-tests)
- [Continuous Integration & Deployment](#continuous-integration--deployment)
- [Production Deployment on AWS](#production-deployment-on-aws)
- [Relevant Notes](#relevant-notes)
- [API Endpoints](#api-endpoints)

## Introduction
This project is a backend API built using Node.js and Express, with PostgreSQL as the database and Sequelize as the ORM. It features JWT-based authentication and tracks game completion events for users.

## Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/en/) (version 14.x or higher)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [AWS CLI](https://aws.amazon.com/cli/) (for deployment)
- [AWS CDK](https://aws.amazon.com/cdk/) (for deploying infrastructure)

### Database Setup
The application uses Sequelize for managing the database schema. The latest migrations will run automatically when you start the application with Docker Compose.

## Running the Application

### Development
To run the application in development mode, use Docker Compose:

1. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```
2. The application should be available at `http://localhost:3000`.

### Production
For a production-like environment:

1. The production Docker Compose file simulates a production environment locally but **should not** be used for actual production deployments. For real production environments, use the Cloud Development Kit (CDK), which is an Infrastructure as Code (IaC) tool to deploy the infrastructure.

2. To simulate a production environment locally:
   ```bash
   docker-compose -f docker-compose.yml up --build
   ```

## Running Tests
To execute the automated tests:

1. Spin up the test environment using Docker Compose:
   ```bash
   docker-compose -f docker-compose.test.yml up --build
   ```
2. Once the environment is up, run the tests:
   ```bash
   docker exec node-backend-test npm run test
   ```
This will execute the test suite within the running Docker container.

## Continuous Integration & Deployment

This project uses GitHub Actions for CI/CD. The CI/CD pipeline is defined in the `.github/workflows/ci-cd.yml` file.

### CI/CD Pipeline Overview

1. **Build Stage**:
   - Runs on every push or pull request to the `main` branch.
   - The build job checks out the code, sets up Docker, and builds the Docker containers.
   - The test environment is spun up using Docker Compose, and the test suite is executed.
   - If the tests pass, the Docker Compose services are shut down.

2. **Deploy Stage**:
   - The deploy stage is triggered after a successful build on pushes to the `main` branch.
   - The deploy job checks out the code and sets up Docker.
   - AWS CLI is configured using credentials stored in GitHub Secrets.
   - The Docker image is built and pushed to Amazon ECR.
   - The ECS service is updated with the new Docker image, which triggers a new deployment in AWS.

### How to Trigger the Pipeline
- The pipeline is triggered automatically on push or pull request events to the `main` branch.
- To manually trigger the pipeline, push a commit or open a pull request to the `main` branch.

## Production Deployment on AWS

To deploy the application in production on AWS using AWS CDK, follow these instructions:

### Prerequisites
- Make sure you have installed and configured the AWS CLI and AWS CDK on your local machine.
- Set up your AWS credentials using `aws configure`.

### Deployment Steps

1. **Bootstrap Your AWS Environment (only needed once per environment)**:
   ```bash
   cdk bootstrap aws://<AWS_ACCOUNT_ID>/<AWS_REGION>
   ```

2. **Update Configuration**:
   - Navigate to `lib/app-stack.ts` and update the following:
     - **VPC ID**: Update the `vpcId` variable with the ID of the VPC where you want to deploy your resources.
     - **Key Name**: Update the `keyName` in `app-stack.ts` with your SSH key name to be able to SSH into the EC2 instance.
     - **Task Execution Role**: Update `ecsTaskExecutionRoleArn` with your own IAM role that has the necessary permissions to execute ECS tasks.
   - Ensure other configurations such as database credentials and the ECR repository name are correctly set for your environment.

3. **Deploy the Stack**:
   ```bash
   cdk deploy
   ```
   This command will deploy the stack to AWS, creating the necessary infrastructure including VPC, ECS, RDS, and ALB.

4. **Verify Deployment**:
   - Once the deployment is complete, you can verify the deployment by accessing the ALB DNS name provided in the AWS console. The application should be running on the provided endpoint.

## Relevant Notes

- **Environment Variables**: All environment variables are provided in the Docker Compose files, so a `.env` file is not necessary.
- **Database Migrations**: Latest migrations are run automatically when starting the application using Docker Compose.
- **Production Deployments**: The production Docker Compose file is for local simulation only. Use AWS CDK for deploying to actual production environments.

## API Endpoints

### Authentication
- **POST /api/user**: Register a new user.
- **POST /api/sessions**: Log in an existing user and receive a JWT token.

### Game Events
- **POST /api/user/game_events**: Report a game completion event (authenticated).
- **GET /api/user**: Retrieve user details and game stats (authenticated).
