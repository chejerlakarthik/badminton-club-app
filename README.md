# Badminton Club App - Monorepo

![Github Action](https://github.com/chejerlakarthik/badminton-club-app/actions/workflows/ci-cd.yml/badge.svg)

A comprehensive badminton club management application built with modern web technologies using a monorepo architecture.

## 📁 Monorepo Structure

This project uses **pnpm workspaces** for efficient package management and **TypeScript project references** for optimized builds.

```
badminton-club-app/
├── backend/                 # AWS Lambda functions and API
├── frontend/               # React application
├── infrastructure/          # AWS CDK infrastructure code
├── package.json            # Root package.json with workspace config
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── tsconfig.json           # Root TypeScript configuration
└── .github/workflows/      # CI/CD pipelines
```

## 🏗️ Architecture Overview

### Backend (AWS Lambda + TypeScript)
- **Runtime**: Node.js 22.x
- **Framework**: AWS Lambda with TypeScript
- **Database**: DynamoDB
- **Authentication**: JWT-based authentication
- **API Gateway**: REST API with Lambda integration
- **Build System**: esbuild for optimized bundling

### Frontend (React + Vite)
- **Framework**: React 19.x with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Deployment**: AWS S3 + CloudFront

### Infrastructure (AWS CDK)
- **IaC**: AWS CDK v2 with TypeScript
- **Deployment**: Automated CI/CD with GitHub Actions
- **Monitoring**: CloudWatch integration
- **Security**: IAM roles and policies

## 🚀 Getting Started

### Prerequisites
- Node.js 22.x or higher
- pnpm (recommended) or npm
- AWS CLI configured
- AWS CDK CLI installed
- Docker (for local development)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/badminton-club-app.git
cd badminton-club-app

# Install pnpm if you haven't already
npm install -g pnpm

# Install all dependencies (root + all workspaces)
pnpm install
```

## 🛠️ Development

### Available Scripts

#### Root Level Commands
```bash
# Build all packages
pnpm run build

# Build individual packages
pnpm run build:backend
pnpm run build:frontend
pnpm run build:infrastructure

# Run tests for all packages
pnpm run test

# Run linting for all packages
pnpm run lint

# Deploy infrastructure
pnpm run deploy

# Synthesize CDK templates
pnpm run synth
```

#### Package-Specific Commands
```bash
# Run backend development server
pnpm run dev

# Run frontend development server
pnpm --filter frontend run dev

# Run infrastructure build
pnpm --filter infrastructure run build
```

### Development Workflow

1. **Backend Development**
   ```bash
   cd backend
   pnpm run dev
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   pnpm run dev
   ```

3. **Infrastructure Development**
   ```bash
   cd infrastructure
   pnpm run build
   pnpm run cdk:build  # Synthesize CDK app
   ```

## 🚀 Deployment

### Local Build and Deploy
```bash
# Build all components
pnpm run build

# Deploy to AWS
pnpm run deploy
```

### CI/CD Pipeline

The project uses GitHub Actions for automated deployment:

1. **Triggers**: Push to `main` branch
2. **Steps**:
   - Install dependencies
   - Build all packages
   - Run tests
   - Deploy to AWS

## 📋 Package Details

### Backend (`backend/`)
- **Package name**: `backend`
- **Main technologies**: TypeScript, AWS Lambda, DynamoDB
- **Build output**: Individual Lambda function bundles in `dist/`
- **Key scripts**: `build`, `test`, `lint`

### Frontend (`frontend/`)
- **Package name**: `frontend`
- **Main technologies**: React, Vite, Tailwind CSS
- **Build output**: Static files in `build/`
- **Key scripts**: `build`, `dev`, `test`, `lint`

### Infrastructure (`infrastructure/`)
- **Package name**: `infrastructure`
- **Main technologies**: AWS CDK, TypeScript
- **Build output**: CDK synthesized templates in `cdk.out/`
- **Key scripts**: `build`, `cdk:build`, `cdk:deploy`

## 🔧 TypeScript Configuration

The project uses TypeScript project references for efficient builds:

- **Root `tsconfig.json`**: Orchestrates all package builds
- **Package-specific configs**: Each package has its own `tsconfig.json`
- **Incremental builds**: Only changed packages are rebuilt

## 📦 Package Management

### pnpm Workspaces
- **Workspace config**: `pnpm-workspace.yaml`
- **Shared dependencies**: Common dependencies are hoisted to root
- **Isolated dependencies**: Package-specific dependencies remain local

### Dependency Management
```bash
# Add dependency to specific package
pnpm --filter backend add express
pnpm --filter frontend add react-router-dom

# Add dev dependency to root
pnpm add -D -w typescript

# Update all dependencies
pnpm update -r
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests for specific package
pnpm --filter backend run test
pnpm --filter frontend run test
```

## 📚 Documentation

- [Backend Documentation](./backend/README.md) - API endpoints and Lambda functions
- [Frontend Documentation](./frontend/README.md) - React components and UI
- [Infrastructure Documentation](./infrastructure/README.md) - AWS CDK stacks and deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `pnpm run test`
5. Run linting: `pnpm run lint`
6. Commit your changes: `git commit -am 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Note**: This is a monorepo project. Always run commands from the root directory unless specifically working on a single package.
