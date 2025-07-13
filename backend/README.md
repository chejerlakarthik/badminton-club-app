# Badminton Club Serverless Backend

A comprehensive serverless backend for badminton club management built with AWS services, TypeScript, and Node.js.

## Architecture

- **AWS Lambda**: Serverless compute for API endpoints
- **Amazon DynamoDB**: NoSQL database for data storage
- **Amazon EventBridge**: Event-driven architecture for decoupled services
- **Amazon SES**: Email notifications
- **Amazon SNS**: SMS notifications
- **AWS CDK**: Infrastructure as Code

## Features

- User authentication and authorization (JWT)
- Member management with different membership types
- Court booking system with conflict detection
- Tournament management and registration
- Event-driven notifications
- Admin dashboard with analytics

## Setup Instructions

### Prerequisites

- Node.js 18.x or later
- AWS CLI configured
- AWS CDK CLI installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/badminton-club-app.git
cd badminton-club-app
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Deploy to AWS:
```bash
npm run deploy
```

### Environment Configuration

Update the following environment variables in the CDK stack:

- `JWT_SECRET`: Your JWT secret key (use AWS Secrets Manager in production)
- `SES_FROM_EMAIL`: Your verified SES email address

### API Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

#### Courts
- `GET /courts` - Get all courts
- `POST /courts` - Create court (admin only)

#### Bookings
- `POST /bookings` - Create booking
- `GET /bookings/my` - Get user's bookings
- `PUT /bookings/{id}/status` - Update booking status

#### Tournaments
- `GET /tournaments` - Get all tournaments
- `POST /tournaments` - Create tournament (admin only)
- `POST /tournaments/{id}/register` - Register for tournament

## Development

### Local Development

```bash
# Watch for changes
npm run watch

# Run tests
npm test
```

### Deployment

```bash
# Deploy to AWS
npm run deploy

# Destroy stack
npm run destroy
```

## Data Model

The application uses a single DynamoDB table with the following access patterns:

- Users: `PK: USER#{userId}`, `SK: USER#{userId}`
- Courts: `PK: COURT#{courtId}`, `SK: COURT#{courtId}`
- Bookings: `PK: BOOKING#{bookingId}`, `SK: BOOKING#{bookingId}`
- Tournaments: `PK: TOURNAMENT#{tournamentId}`, `SK: TOURNAMENT#{tournamentId}`

Global Secondary Indexes:
- GSI1: User bookings (`GSI1PK: USER#{userId}`, `GSI1SK: BOOKING#{date}#{time}`)
- GSI2: Court bookings (`GSI2PK: COURT#{courtId}`, `GSI2SK: BOOKING#{date}#{time}`)

## Event-Driven Architecture

The system uses EventBridge for decoupled event processing:

- Booking events trigger email/SMS notifications
- User registration events trigger welcome emails
- Tournament events trigger participant notifications

## Security

- JWT-based authentication
- Role-based authorization (member/admin)
- Input validation with Zod
- CORS enabled for web applications

## Monitoring

- CloudWatch logs for all Lambda functions
- DynamoDB metrics
- API Gateway access logs

## License

MIT License