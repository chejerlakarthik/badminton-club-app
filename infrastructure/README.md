# Badminton Club App - Infrastructure

This directory contains the AWS CDK (Cloud Development Kit) infrastructure code for the Badminton Club application. The infrastructure includes Lambda functions, API Gateway, DynamoDB, EventBridge, and IAM roles required to run the serverless backend.

## Architecture Overview

The infrastructure deploys:

- **AWS Lambda Functions**: 8 serverless functions handling authentication, user management, court management, bookings, and event processing
- **Amazon API Gateway**: REST API with CORS enabled for frontend integration
- **Amazon DynamoDB**: NoSQL database with Global Secondary Index for efficient data access
- **Amazon EventBridge**: Event-driven architecture for decoupled service communication
- **IAM Roles & Policies**: Proper security permissions for all AWS services

## Prerequisites

Before deploying the infrastructure, ensure you have the following installed and configured:

### 1. AWS CLI
```bash
# Install AWS CLI (if not already installed)
brew install awscli  # macOS
# or
pip install awscli   # Python

# Configure AWS credentials
aws configure
```

### 2. Node.js and npm
```bash
# Verify Node.js version (18.x or later required)
node --version
npm --version
```

### 3. AWS CDK CLI
```bash
# Install CDK CLI globally
npm install -g aws-cdk

# Verify installation
cdk --version
```

## Deployment Instructions

Follow these steps in order to deploy the infrastructure:

### Step 1: Install Dependencies

Install the required npm packages for the infrastructure:

```bash
# Navigate to infrastructure directory (if not already there)
cd infrastructure

# Install dependencies
npm install
```

**Why this step is needed**: This installs the AWS CDK libraries and TypeScript dependencies required to build and deploy the infrastructure.

### Step 2: Build the Backend

The CDK deployment depends on the backend Lambda function code being compiled. Build the backend first:

```bash
# Navigate to backend directory
cd ../backend

# Install backend dependencies (if not already done)
npm install

# Build the backend TypeScript code
npm run build
```

**Why this step is needed**: The CDK stack references the `../backend/build` directory for Lambda function code. The build process compiles TypeScript to JavaScript and ensures all dependencies are resolved.

### Step 3: Return to Infrastructure Directory

```bash
# Navigate back to infrastructure directory
cd ../infrastructure
```

### Step 4: Bootstrap CDK (First-time only)

If this is your first time using CDK in this AWS account/region, you need to bootstrap:

```bash
npx cdk bootstrap
```

**Why this step is needed**: CDK bootstrap creates the necessary S3 bucket and IAM roles that CDK uses to deploy resources. This is required once per AWS account/region combination.

**Note**: If you see "bootstrapped (no changes)", it means bootstrapping was already done previously.

### Step 5: Synthesize the CDK Stack

Generate the CloudFormation templates to verify everything is configured correctly:

```bash
npx cdk synth
```

**Why this step is needed**: This step:
- Validates your CDK code for syntax errors
- Generates CloudFormation templates
- Shows you exactly what resources will be created
- Helps catch configuration issues before deployment

### Step 6: Deploy the Stack

Deploy the infrastructure to AWS:

```bash
npx cdk deploy --require-approval never
```

**Why this step is needed**: This command:
- Uploads Lambda function code to S3
- Creates all AWS resources defined in the CDK stack
- Sets up the complete serverless infrastructure
- Provides the API Gateway endpoint URL for frontend integration

**What the `--require-approval never` flag does**: Skips the manual approval prompt for IAM changes, allowing for automated deployment.

## Post-Deployment

After successful deployment, you'll see outputs including:

- **API Gateway Endpoint**: Use this URL in your frontend configuration
- **API Gateway ID**: For reference and debugging
- **Stack ARN**: For AWS console navigation

Example output:
```
✅  BadmintonClubStack

Outputs:
BadmintonClubStack.BadmintonClubApiEndpoint3E1497E5 = https://xxxxxxxxxx.execute-api.ap-southeast-2.amazonaws.com/dev/
BadmintonClubStack.ApiGatewayRestApiId = xxxxxxxxxx
```

## Available API Endpoints

Once deployed, the following endpoints are available:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Court Management
- `GET /courts` - Get all courts
- `POST /courts` - Create new court (admin only)

### Bookings
- `POST /bookings` - Create a new booking

## Environment Configuration

The stack is configured for the `dev` environment by default. Key environment variables set for Lambda functions:

- `STAGE`: `dev`
- `REGION`: `ap-southeast-2`
- `MAIN_TABLE`: DynamoDB table name
- `JWT_SECRET`: JWT signing secret (configure for production)

## Updating the Infrastructure

When you make changes to the infrastructure code:

1. **If backend code changed**: Re-run `npm run build` in the backend directory
2. **If infrastructure changed**: Re-run `npx cdk deploy`

## Useful CDK Commands

- `npx cdk diff` - Compare deployed stack with current state
- `npx cdk destroy` - Delete the stack and all resources
- `npx cdk ls` - List all stacks in the app
- `npx cdk doctor` - Check for common configuration issues

## Troubleshooting

### Common Issues

1. **"Cannot find asset at backend/build"**
   - Solution: Run `npm run build` in the backend directory

2. **"No credentials available"**
   - Solution: Run `aws configure` to set up AWS credentials

3. **"Bootstrap required"**
   - Solution: Run `npx cdk bootstrap`

4. **TypeScript compilation errors**
   - Solution: Check backend TypeScript configuration and fix compilation issues

### Getting Help

- Check AWS CloudFormation console for detailed error messages
- Review Lambda function logs in AWS CloudWatch
- Use `npx cdk doctor` to diagnose common issues

## Security Considerations

- The deployed resources use appropriate IAM roles with least-privilege access
- API Gateway has CORS enabled for web frontend integration
- DynamoDB uses on-demand billing to optimize costs
- Lambda functions have 30-second timeouts and 256MB memory allocation

## Cost Optimization

- DynamoDB uses PAY_PER_REQUEST billing mode
- Lambda functions are sized appropriately for the workload
- API Gateway uses the REST API (not HTTP API) for feature completeness

## Project Structure

```
infrastructure/
├── bin/
│   └── badminton-club.ts      # CDK app entry point
├── lib/
│   └── badminton-club-stack.ts # Main infrastructure stack
├── cdk.json                   # CDK configuration
├── package.json              # npm dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Support

For issues related to:
- **Infrastructure deployment**: Check this README and CDK documentation
- **Backend functionality**: See `../backend/README.md`
- **Frontend integration**: See `../frontend/README.md`
