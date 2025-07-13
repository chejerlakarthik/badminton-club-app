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

## API Testing Guide

**API Gateway Base URL**: `https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/`

### Authentication Flow

The backend uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. **Register** or **Login** to obtain a JWT token
2. **Include the token** in the `Authorization` header as `Bearer <token>` for protected endpoints

### API Endpoints

#### 1. User Registration

- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Authentication**: Not required
- **Description**: Register a new user and obtain a JWT token

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "strongpassword123",
  "phone": "1234567890",
  "membershipType": "basic",
  "skillLevel": "beginner"
}
```

**Required Fields**: `firstName`, `lastName`, `email`, `password`, `phone`
**Optional Fields**: `membershipType` (basic|premium|student|family), `skillLevel` (beginner|intermediate|advanced)

**curl Example**:
```bash
curl -X POST \
  'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "strongpassword123",
    "phone": "1234567890"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "membershipType": "basic",
      "role": "member"
    }
  }
}
```

#### 2. User Login

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Authentication**: Not required
- **Description**: Authenticate an existing user and obtain a JWT token

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "strongpassword123"
}
```

**curl Example**:
```bash
curl -X POST \
  'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john.doe@example.com",
    "password": "strongpassword123"
  }'
```

**Response**: Same format as registration

#### 3. Get User Profile

- **Method**: `GET`
- **Endpoint**: `/users/profile`
- **Authentication**: Required (Bearer token)
- **Description**: Retrieve the authenticated user's profile

**curl Example**:
```bash
curl -X GET \
  'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/users/profile' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "PK": "USER#user-uuid",
    "SK": "USER#user-uuid",
    "userId": "user-uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "membershipType": "basic",
    "skillLevel": "beginner",
    "role": "member",
    "isActive": true,
    "createdAt": "2025-07-13T07:00:00.000Z",
    "updatedAt": "2025-07-13T07:00:00.000Z"
  }
}
```

#### 4. Get Courts

- **Method**: `GET`
- **Endpoint**: `/courts`
- **Authentication**: Not required
- **Description**: Retrieve all active courts

**curl Example**:
```bash
curl -X GET \
  'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/courts'
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "PK": "COURT#court-uuid",
      "SK": "COURT#court-uuid",
      "courtId": "court-uuid",
      "name": "Court 1",
      "type": "indoor",
      "hourlyRate": 25.00,
      "description": "Premium indoor court",
      "isActive": true,
      "createdAt": "2025-07-13T07:00:00.000Z",
      "updatedAt": "2025-07-13T07:00:00.000Z"
    }
  ]
}
```

#### 5. Create Booking

- **Method**: `POST`
- **Endpoint**: `/bookings`
- **Authentication**: Required (Bearer token)
- **Description**: Create a new court booking

**Request Body**:
```json
{
  "courtId": "court-uuid-from-courts-endpoint",
  "date": "2025-07-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "notes": "Friendly match with colleagues"
}
```

**Required Fields**: `courtId`, `date`, `startTime`, `endTime`
**Optional Fields**: `notes`
**Time Format**: HH:MM (24-hour format)
**Date Format**: YYYY-MM-DD

**curl Example**:
```bash
curl -X POST \
  'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/bookings' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "courtId": "court-uuid-from-courts-endpoint",
    "date": "2025-07-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "notes": "Friendly match"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "PK": "BOOKING#booking-uuid",
    "SK": "BOOKING#booking-uuid",
    "bookingId": "booking-uuid",
    "userId": "user-uuid",
    "courtId": "court-uuid",
    "date": "2025-07-15",
    "startTime": "10:00",
    "endTime": "11:00",
    "totalAmount": 25.00,
    "status": "pending",
    "paymentStatus": "pending",
    "notes": "Friendly match",
    "createdAt": "2025-07-13T07:00:00.000Z",
    "updatedAt": "2025-07-13T07:00:00.000Z"
  }
}
```

### Testing Workflow

1. **Start with Registration or Login**:
   ```bash
   # Register a new user
   TOKEN=$(curl -s -X POST \
     'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/auth/register' \
     -H 'Content-Type: application/json' \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","phone":"1234567890"}' \
     | jq -r '.data.token')
   ```

2. **Get Courts (to find a court ID)**:
   ```bash
   curl -X GET 'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/courts'
   ```

3. **Use the token for protected endpoints**:
   ```bash
   # Get user profile
   curl -X GET \
     'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/users/profile' \
     -H "Authorization: Bearer $TOKEN"
   
   # Create a booking (replace COURT_ID with actual court ID)
   curl -X POST \
     'https://kcxp7lrl14.execute-api.ap-southeast-2.amazonaws.com/dev/bookings' \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' \
     -d '{"courtId":"COURT_ID","date":"2025-07-15","startTime":"10:00","endTime":"11:00"}'
   ```

### Error Responses

- **400 Bad Request**: Validation errors or missing required fields
- **401 Unauthorized**: Invalid or missing authentication token
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

**Example Error Response**:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Tips for Testing

1. **Save the JWT token** from login/register responses for subsequent requests
2. **Check court availability** before creating bookings
3. **Use proper date/time formats** (YYYY-MM-DD for dates, HH:MM for times)
4. **Include Content-Type header** for POST requests with JSON body
5. **Test with different user roles** (member vs admin) if needed

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