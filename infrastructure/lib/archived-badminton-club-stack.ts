import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class ArchivedBadmintonClubStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // DynamoDB Table
        const table = new dynamodb.Table(this, 'BadmintonClubTable', {
            tableName: 'BadmintonClubTable',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Add Global Secondary Indexes
        table.addGlobalSecondaryIndex({
            indexName: 'GSI1',
            partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
        });

        table.addGlobalSecondaryIndex({
            indexName: 'GSI2',
            partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
        });

        // EventBridge Custom Bus
        const eventBus = new events.EventBus(this, 'BadmintonClubEventBus', {
            eventBusName: 'badminton-club-events',
        });

        // SNS Topic for notifications
        const notificationTopic = new sns.Topic(this, 'BadmintonClubNotifications', {
            topicName: 'badminton-club-notifications',
        });

        // Common Lambda environment variables
        const commonEnvironment = {
            TABLE_NAME: table.tableName,
            EVENT_BUS_NAME: eventBus.eventBusName,
            SNS_TOPIC_ARN: notificationTopic.topicArn,
            JWT_SECRET: 'your-jwt-secret-key', // Use AWS Secrets Manager in production
            SES_FROM_EMAIL: 'noreply@yourdomain.com', // Replace with your verified SES email
        };

        // Lambda Layer for common dependencies
        const nodeModulesLayer = new lambda.LayerVersion(this, 'NodeModulesLayer', {
            code: lambda.Code.fromAsset('lambda-layers/node-modules'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
            description: 'Node modules layer for badminton club functions',
        });

        // Auth Lambdas
        const registerFunction = new lambda.Function(this, 'RegisterFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'register.handler',
            code: lambda.Code.fromAsset('build/lambdas/auth'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(30),
        });

        const loginFunction = new lambda.Function(this, 'LoginFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'login.handler',
            code: lambda.Code.fromAsset('build/lambdas/auth'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
            timeout: cdk.Duration.seconds(30),
        });

        // User Management Lambdas
        const getUserProfileFunction = new lambda.Function(this, 'GetUserProfileFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'get-profile.handler',
            code: lambda.Code.fromAsset('build/lambdas/users'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        const updateUserProfileFunction = new lambda.Function(this, 'UpdateUserProfileFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'update-profile.handler',
            code: lambda.Code.fromAsset('build/lambdas/users'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        // Court Management Lambdas
        const getCourtsFunction = new lambda.Function(this, 'GetCourtsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'get-courts.handler',
            code: lambda.Code.fromAsset('build/lambdas/courts'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        const createCourtFunction = new lambda.Function(this, 'CreateCourtFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'create-court.handler',
            code: lambda.Code.fromAsset('build/lambdas/courts'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        // Booking Management Lambdas
        const createBookingFunction = new lambda.Function(this, 'CreateBookingFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'create.handler',
            code: lambda.Code.fromAsset('build/lambdas/bookings'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        const getBookingsFunction = new lambda.Function(this, 'GetBookingsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'get-bookings.handler',
            code: lambda.Code.fromAsset('build/lambdas/bookings'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        const updateBookingFunction = new lambda.Function(this, 'UpdateBookingFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'update-booking.handler',
            code: lambda.Code.fromAsset('build/lambdas/bookings'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        // Tournament Management Lambdas
        const getTournamentsFunction = new lambda.Function(this, 'GetTournamentsFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'get-tournaments.handler',
            code: lambda.Code.fromAsset('build/lambdas/tournaments'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        const createTournamentFunction = new lambda.Function(this, 'CreateTournamentFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'create-tournament.handler',
            code: lambda.Code.fromAsset('build/lambdas/tournaments'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        const registerTournamentFunction = new lambda.Function(this, 'RegisterTournamentFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'register-tournament.handler',
            code: lambda.Code.fromAsset('build/lambdas/tournaments'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        // Event Processing Lambda
        const bookingProcessorFunction = new lambda.Function(this, 'BookingProcessorFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'booking-processor.handler',
            code: lambda.Code.fromAsset('build/lambdas/events'),
            environment: commonEnvironment,
            layers: [nodeModulesLayer],
        });

        // Grant permissions
        const lambdaFunctions = [
            registerFunction,
            loginFunction,
            getUserProfileFunction,
            updateUserProfileFunction,
            getCourtsFunction,
            createCourtFunction,
            createBookingFunction,
            getBookingsFunction,
            updateBookingFunction,
            getTournamentsFunction,
            createTournamentFunction,
            registerTournamentFunction,
            bookingProcessorFunction,
        ];

        lambdaFunctions.forEach(func => {
            table.grantReadWriteData(func);
            eventBus.grantPutEventsTo(func);
            notificationTopic.grantPublish(func);

            // Grant SES permissions
            func.addToRolePolicy(new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['ses:SendEmail', 'ses:SendRawEmail'],
                resources: ['*'],
            }));

            // Grant SNS SMS permissions
            func.addToRolePolicy(new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['sns:Publish'],
                resources: ['*'],
            }));
        });

        // EventBridge Rules
        const bookingRule = new events.Rule(this, 'BookingRule', {
            eventBus: eventBus,
            eventPattern: {
                source: ['badminton-club.bookings'],
            },
        });
        bookingRule.addTarget(new targets.LambdaFunction(bookingProcessorFunction));

        // API Gateway
        const api = new apigateway.RestApi(this, 'BadmintonClubApi', {
            restApiName: 'Badminton Club API',
            description: 'API for badminton club management',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization'],
            },
        });

        // Auth routes
        const authResource = api.root.addResource('auth');
        authResource.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(registerFunction));
        authResource.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(loginFunction));

        // User routes
        const usersResource = api.root.addResource('users');
        usersResource.addResource('profile').addMethod('GET', new apigateway.LambdaIntegration(getUserProfileFunction));
        usersResource.addResource('profile').addMethod('PUT', new apigateway.LambdaIntegration(updateUserProfileFunction));

        // Court routes
        const courtsResource = api.root.addResource('courts');
        courtsResource.addMethod('GET', new apigateway.LambdaIntegration(getCourtsFunction));
        courtsResource.addMethod('POST', new apigateway.LambdaIntegration(createCourtFunction));

        // Booking routes
        const bookingsResource = api.root.addResource('bookings');
        bookingsResource.addMethod('POST', new apigateway.LambdaIntegration(createBookingFunction));
        bookingsResource.addMethod('GET', new apigateway.LambdaIntegration(getBookingsFunction));
        bookingsResource.addResource('my').addMethod('GET', new apigateway.LambdaIntegration(getBookingsFunction));
        bookingsResource.addResource('{id}').addResource('status').addMethod('PUT', new apigateway.LambdaIntegration(updateBookingFunction));

        // Tournament routes
        const tournamentsResource = api.root.addResource('tournaments');
        tournamentsResource.addMethod('GET', new apigateway.LambdaIntegration(getTournamentsFunction));
        tournamentsResource.addMethod('POST', new apigateway.LambdaIntegration(createTournamentFunction));
        tournamentsResource.addResource('{id}').addResource('register').addMethod('POST', new apigateway.LambdaIntegration(registerTournamentFunction));

        // Outputs
        new cdk.CfnOutput(this, 'ApiGatewayUrl', {
            value: api.url,
            description: 'API Gateway URL',
        });

        new cdk.CfnOutput(this, 'TableName', {
            value: table.tableName,
            description: 'DynamoDB Table Name',
        });

        new cdk.CfnOutput(this, 'EventBusName', {
            value: eventBus.eventBusName,
            description: 'EventBridge Bus Name',
        });
    }
}