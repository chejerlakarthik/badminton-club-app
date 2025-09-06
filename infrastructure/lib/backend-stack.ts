import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
// import * as ssm from 'aws-cdk-lib/aws-ssm';

export class BackendStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // DynamoDB Table (Single Table Design)
        const mainTable = new dynamodb.TableV2(this, 'MainTable', {
            tableName: `badminton-club-${this.node.tryGetContext('stage')}-main`,
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            globalSecondaryIndexes: [
                {
                    indexName: 'GSI1',
                    partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
                    sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
                {
                    indexName: 'GSI2',
                    partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
                    sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
            ],
        });

        // Lambda function environment variables
        const lambdaEnv = {
            STAGE: this.node.tryGetContext('stage') || 'dev',
            REGION: this.region,
            MAIN_TABLE: mainTable.tableName,
            JWT_SECRET: 'test-secret-key', // For dev only - use SSM in production
        };

        // Helper to create Lambda functions
        const createLambda = (id: string, codePath: string) => {
            const fn = new lambda.Function(this, id, {
                runtime: lambda.Runtime.NODEJS_22_X,
                handler: 'index.handler',
                code: lambda.Code.fromAsset(`../backend/dist/${codePath}`),
                memorySize: 256,
                timeout: cdk.Duration.seconds(30),
                environment: lambdaEnv,
            });
            mainTable.grantReadWriteData(fn);
            // Grant SES, SNS, EventBridge permissions
            fn.addToRolePolicy(new iam.PolicyStatement({
                actions: [
                    "ses:SendEmail",
                    "ses:SendRawEmail",
                    "sns:Publish",
                    "events:PutEvents"
                ],
                resources: ["*"]
            }));
            return fn;
        };

        // Lambda Functions
        const registerLambda = createLambda('RegisterLambda', 'auth/register');
        const loginLambda = createLambda('LoginLambda', 'auth/login');
        const getProfileLambda = createLambda('GetProfileLambda', 'users/get-profile');
        const updateProfileLambda = createLambda('UpdateProfileLambda', 'users/update-profile');
        const createBookingLambda = createLambda('CreateBookingLambda', 'bookings/create');
        const createCourtLambda = createLambda('CreateCourtLambda', 'courts/create-court');
        const getCourtsLambda = createLambda('GetCourtsLambda', 'courts/get-courts');
        const bookingProcessorLambda = createLambda('BookingProcessorLambda', 'events/booking-processor');

        // API Gateway
        const api = new apigateway.RestApi(this, 'BadmintonClubApi', {
            restApiName: 'BadmintonClubRestApi',
            deployOptions: {
                stageName: lambdaEnv.STAGE,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
            },
        });

        // Auth routes (no authorization required)
        const auth = api.root.addResource('auth');
        auth.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(registerLambda));
        auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(loginLambda));

        // User routes
        const users = api.root.addResource('users');
        const profile = users.addResource('profile');
        profile.addMethod('GET', new apigateway.LambdaIntegration(getProfileLambda));
        profile.addMethod('PUT', new apigateway.LambdaIntegration(updateProfileLambda));

        // Booking routes
        const bookings = api.root.addResource('bookings');
        bookings.addMethod('POST', new apigateway.LambdaIntegration(createBookingLambda));

        // Court routes
        const courts = api.root.addResource('courts');
        courts.addMethod('POST', new apigateway.LambdaIntegration(createCourtLambda));
        courts.addMethod('GET', new apigateway.LambdaIntegration(getCourtsLambda));

        // Event rules for booking processor
        const eventBus = new events.EventBus(this, 'BadmintonClubEventBus', {
            eventBusName: `badminton-club-${this.node.tryGetContext('stage')}`
        });

        new events.Rule(this, 'BookingProcessorRule', {
            eventBus: eventBus,
            eventPattern: {
                source: ['badminton-club'],
                detailType: ['User Registered', 'Booking Created', 'Court Created']
            },
            targets: [new targets.LambdaFunction(bookingProcessorLambda)],
        });

        // Outputs
        new cdk.CfnOutput(this, 'ApiGatewayRestApiId', {
            value: api.restApiId,
        });
        new cdk.CfnOutput(this, 'ApiGatewayRestApiRootResourceId', {
            value: api.restApiRootResourceId,
        });
    }
}