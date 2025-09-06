# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Architecture Overview

This is a TypeScript monorepo for a serverless badminton club management application using:

- **Monorepo Management**: pnpm workspaces with TypeScript project references
- **Backend**: AWS Lambda functions (Node.js 22.x) with DynamoDB, EventBridge, SES, SNS
- **Frontend**: React 19.x with Vite, Tailwind CSS, and Vitest
- **Infrastructure**: AWS CDK v2 for Infrastructure as Code
- **CI/CD**: GitHub Actions with automated deployment to AWS

### Key Technologies
- **Runtime**: Node.js 22.x across all packages
- **Build System**: esbuild (backend), Vite (frontend), TypeScript compilation (infrastructure)
- **Database**: DynamoDB with single-table design and GSI patterns
- **Testing**: Vitest across all packages
- **Authentication**: JWT-based with bcrypt password hashing
- **Event Architecture**: EventBridge for decoupled service communication

## Development Commands

### Root Level (Monorepo)
```bash
# Install all dependencies
pnpm install

# Build all packages in dependency order
pnpm run build

# Run tests across all packages
pnpm run test

# Lint all packages
pnpm run lint

# Deploy infrastructure to AWS
pnpm run deploy

# Synthesize CDK templates
pnpm run synth

# Clean and reset all dependencies
pnpm run reset
```

### Backend Development
```bash
# Development with hot-swap deployment
pnpm run dev  # or from backend/: pnpm run dev

# Build TypeScript with esbuild
pnpm run build:backend

# Run tests with Vitest
pnpm run test:backend

# Run single test file
pnpm --filter backend run test src/tests/lambdas/auth/login.test.ts

# Lint backend code
pnpm --filter backend run lint
```

### Frontend Development
```bash
# Start development server
pnpm --filter frontend run dev

# Build for production
pnpm run build:frontend

# Run tests with Vitest
pnpm run test:frontend

# Preview production build
pnpm --filter frontend run preview
```

### Infrastructure Management
```bash
# Build CDK TypeScript
pnpm run build:infrastructure

# Synthesize CloudFormation templates
pnpm run synth

# Deploy all stacks
pnpm run deploy

# Deploy specific stacks
pnpm --filter infrastructure run cdk:deploy:backend
pnpm --filter infrastructure run cdk:deploy:frontend

# View diff of changes
pnpm --filter infrastructure run cdk diff

# Destroy infrastructure
pnpm --filter infrastructure run cdk destroy
```

## Code Organization

### Backend Architecture (`backend/src/app/`)
```
lambdas/
├── auth/           # Authentication handlers (login, register)
├── users/          # User management (profile CRUD)
├── courts/         # Court management
├── bookings/       # Booking system with conflict detection
└── events/         # EventBridge event processors

data/               # Database layer and models
utils/              # Shared utilities (auth, events, notifications)
types/              # TypeScript type definitions
```

### Lambda Function Structure
- Each Lambda is built separately with esbuild via `backend/build.js`
- Handlers follow consistent pattern with error handling and response utilities
- Database operations use DynamoDB DocumentClient with typed interfaces
- Event-driven architecture with EventBridge for notifications

### DynamoDB Design Patterns
- Single table design with PK/SK patterns:
  - Users: `PK: USER#{userId}`, `SK: USER#{userId}`
  - Courts: `PK: COURT#{courtId}`, `SK: COURT#{courtId}`  
  - Bookings: `PK: BOOKING#{bookingId}`, `SK: BOOKING#{bookingId}`
- GSI patterns for queries:
  - GSI1: User bookings (`GSI1PK: USER#{userId}`, `GSI1SK: BOOKING#{date}#{time}`)
  - GSI2: Court bookings (`GSI2PK: COURT#{courtId}`, `GSI2SK: BOOKING#{date}#{time}`)

### Frontend Architecture (`frontend/src/`)
- React 19.x with TypeScript and JSX
- Component-based architecture in `components/`
- Vite for build tooling with fast HMR
- Tailwind CSS for styling
- Vitest + React Testing Library for testing

### Infrastructure Patterns (`infrastructure/`)
- AWS CDK v2 with TypeScript
- Separate stacks for backend and frontend resources
- Lambda functions reference pre-built assets from `../backend/dist/`
- API Gateway with CORS configuration
- EventBridge rules for event-driven notifications

## Testing Strategy

### Running Tests
```bash
# All tests
pnpm run test

# Specific package tests  
pnpm --filter backend run test
pnpm --filter frontend run test

# Single test file
pnpm --filter backend run test src/tests/lambdas/auth/login.test.ts

# Watch mode
pnpm --filter frontend run test --watch
```

### Test Patterns
- **Backend**: Unit tests for Lambda handlers with mocked AWS services
- **Frontend**: Component tests with React Testing Library
- **Mocking**: Vitest mocks for AWS SDK, database operations, and external dependencies

## Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- CDK CLI installed (`npm install -g aws-cdk`)
- AWS region: `ap-southeast-2`

### Local Deployment
1. Build backend: `pnpm run build:backend`
2. Build infrastructure: `pnpm run build:infrastructure`
3. Deploy: `pnpm run deploy`

### CI/CD Pipeline
- Triggered on push to `main` branch
- Builds all packages, runs tests, deploys infrastructure
- Uses GitHub Secrets for AWS credentials
- Separate deployment commands for backend and frontend stacks

## Key Configuration Files

- `pnpm-workspace.yaml`: Workspace configuration
- `tsconfig.json`: Root TypeScript project references
- `backend/build.js`: esbuild configuration for Lambda functions
- `infrastructure/cdk.json`: CDK app configuration
- `.github/workflows/ci-cd.yml`: GitHub Actions workflow

## Environment Variables

### Backend Lambda Environment
- `STAGE`: Deployment stage (dev/prod)
- `REGION`: AWS region (ap-southeast-2)
- `MAIN_TABLE`: DynamoDB table name
- `JWT_SECRET`: JWT signing secret

### Development Notes
- Use `pnpm run dev` in backend for hot-swap Lambda deployments during development
- Frontend dev server runs on default Vite port with HMR
- CDK synthesis must be run before deployment to generate CloudFormation templates
- Always build backend before deploying infrastructure (CDK references `../backend/dist/`)
