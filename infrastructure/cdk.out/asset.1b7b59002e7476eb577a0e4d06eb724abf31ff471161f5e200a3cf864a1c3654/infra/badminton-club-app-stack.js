"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadmintonClubAppStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const events = require("aws-cdk-lib/aws-events");
const targets = require("aws-cdk-lib/aws-events-targets");
const iam = require("aws-cdk-lib/aws-iam");
const ssm = require("aws-cdk-lib/aws-ssm");
class BadmintonClubAppStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // DynamoDB Tables
        const usersTable = new dynamodb.TableV2(this, 'UsersTable', {
            tableName: `badminton-club-api-${this.node.tryGetContext('stage')}-users`,
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            globalSecondaryIndexes: [
                {
                    indexName: 'EmailIndex',
                    partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
            ],
        });
        const pollsTable = new dynamodb.TableV2(this, 'PollsTable', {
            tableName: `badminton-club-api-${this.node.tryGetContext('stage')}-polls`,
            partitionKey: { name: 'pollId', type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            globalSecondaryIndexes: [
                {
                    indexName: 'SessionDateIndex',
                    partitionKey: { name: 'sessionDate', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
                {
                    indexName: 'StatusIndex',
                    partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
                    sortKey: { name: 'sessionDate', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
            ],
        });
        const responsesTable = new dynamodb.TableV2(this, 'ResponsesTable', {
            tableName: `badminton-club-api-${this.node.tryGetContext('stage')}-responses`,
            partitionKey: { name: 'responseId', type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            globalSecondaryIndexes: [
                {
                    indexName: 'PollIndex',
                    partitionKey: { name: 'pollId', type: dynamodb.AttributeType.STRING },
                    sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
            ],
        });
        const expensesTable = new dynamodb.TableV2(this, 'ExpensesTable', {
            tableName: `badminton-club-api-${this.node.tryGetContext('stage')}-expenses`,
            partitionKey: { name: 'expenseId', type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            globalSecondaryIndexes: [
                {
                    indexName: 'SessionDateIndex',
                    partitionKey: { name: 'sessionDate', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
            ],
        });
        const invitationsTable = new dynamodb.TableV2(this, 'InvitationsTable', {
            tableName: `badminton-club-api-${this.node.tryGetContext('stage')}-invitations`,
            partitionKey: { name: 'invitationId', type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            globalSecondaryIndexes: [
                {
                    indexName: 'TokenIndex',
                    partitionKey: { name: 'token', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
                {
                    indexName: 'EmailIndex',
                    partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                },
            ],
        });
        const clubSettingsTable = new dynamodb.TableV2(this, 'ClubSettingsTable', {
            tableName: `badminton-club-api-${this.node.tryGetContext('stage')}-club-settings`,
            partitionKey: { name: 'settingKey', type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Lambda function environment variables
        const lambdaEnv = {
            STAGE: this.node.tryGetContext('stage') || 'dev',
            REGION: this.region,
            USERS_TABLE: usersTable.tableName,
            POLLS_TABLE: pollsTable.tableName,
            RESPONSES_TABLE: responsesTable.tableName,
            EXPENSES_TABLE: expensesTable.tableName,
            INVITATIONS_TABLE: invitationsTable.tableName,
            CLUB_SETTINGS_TABLE: clubSettingsTable.tableName,
            JWT_SECRET: ssm.StringParameter.valueForStringParameter(this, `/badminton-club/${this.node.tryGetContext('stage') || 'dev'}/jwt-secret`),
        };
        // Helper to create Lambda functions
        const createLambda = (id, handler) => {
            const fn = new lambda.Function(this, id, {
                runtime: lambda.Runtime.NODEJS_18_X,
                handler,
                code: lambda.Code.fromAsset('dist'),
                memorySize: 256,
                timeout: cdk.Duration.seconds(30),
                environment: lambdaEnv,
            });
            usersTable.grantReadWriteData(fn);
            pollsTable.grantReadWriteData(fn);
            responsesTable.grantReadWriteData(fn);
            expensesTable.grantReadWriteData(fn);
            invitationsTable.grantReadWriteData(fn);
            clubSettingsTable.grantReadWriteData(fn);
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
        const registerLambda = createLambda('RegisterLambda', 'src/functions/auth/register.handler');
        const loginLambda = createLambda('LoginLambda', 'src/functions/auth/login.handler');
        const getProfileLambda = createLambda('GetProfileLambda', 'src/functions/users/getProfile.handler');
        const updateProfileLambda = createLambda('UpdateProfileLambda', 'src/functions/users/updateProfile.handler');
        const getMembersLambda = createLambda('GetMembersLambda', 'src/functions/users/getMembers.handler');
        const getCurrentPollLambda = createLambda('GetCurrentPollLambda', 'src/functions/polls/getCurrentPoll.handler');
        const createPollLambda = createLambda('CreatePollLambda', 'src/functions/polls/createPoll.handler');
        const submitResponseLambda = createLambda('SubmitResponseLambda', 'src/functions/polls/submitResponse.handler');
        const getPollHistoryLambda = createLambda('GetPollHistoryLambda', 'src/functions/polls/getPollHistory.handler');
        const sendInvitationLambda = createLambda('SendInvitationLambda', 'src/functions/invitations/sendInvitation.handler');
        const acceptInvitationLambda = createLambda('AcceptInvitationLambda', 'src/functions/invitations/acceptInvitation.handler');
        const getExpensesLambda = createLambda('GetExpensesLambda', 'src/functions/expenses/getExpenses.handler');
        const createExpenseLambda = createLambda('CreateExpenseLambda', 'src/functions/expenses/createExpense.handler');
        const getSettingsLambda = createLambda('GetSettingsLambda', 'src/functions/settings/getSettings.handler');
        const updateSettingsLambda = createLambda('UpdateSettingsLambda', 'src/functions/settings/updateSettings.handler');
        const autoCreateWeeklyPollLambda = createLambda('AutoCreateWeeklyPollLambda', 'src/functions/scheduled/autoCreateWeeklyPoll.handler');
        const freezePollsLambda = createLambda('FreezePollsLambda', 'src/functions/scheduled/freezePolls.handler');
        const sendRemindersLambda = createLambda('SendRemindersLambda', 'src/functions/scheduled/sendReminders.handler');
        const authorizerLambda = createLambda('AuthorizerLambda', 'src/functions/auth/authorizer.handler');
        // API Gateway
        const api = new apigateway.RestApi(this, 'BadmintonClubApi', {
            restApiName: 'Badminton Club Service',
            deployOptions: {
                stageName: lambdaEnv.STAGE,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
            },
        });
        // Lambda Authorizer
        const lambdaAuthorizer = new apigateway.TokenAuthorizer(this, 'LambdaAuthorizer', {
            handler: authorizerLambda,
            identitySource: apigateway.IdentitySource.header('Authorization'),
        });
        // Auth routes
        const auth = api.root.addResource('auth');
        auth.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(registerLambda), { authorizationType: apigateway.AuthorizationType.NONE });
        auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(loginLambda), { authorizationType: apigateway.AuthorizationType.NONE });
        // User routes
        const users = api.root.addResource('users');
        users.addResource('profile').addMethod('GET', new apigateway.LambdaIntegration(getProfileLambda), { authorizer: lambdaAuthorizer });
        users.addResource('profile').addMethod('PUT', new apigateway.LambdaIntegration(updateProfileLambda), { authorizer: lambdaAuthorizer });
        users.addResource('members').addMethod('GET', new apigateway.LambdaIntegration(getMembersLambda), { authorizer: lambdaAuthorizer });
        // Poll routes
        const polls = api.root.addResource('polls');
        polls.addResource('current').addMethod('GET', new apigateway.LambdaIntegration(getCurrentPollLambda), { authorizer: lambdaAuthorizer });
        polls.addMethod('POST', new apigateway.LambdaIntegration(createPollLambda), { authorizer: lambdaAuthorizer });
        polls.addResource('history').addMethod('GET', new apigateway.LambdaIntegration(getPollHistoryLambda), { authorizer: lambdaAuthorizer });
        const pollId = polls.addResource('{pollId}');
        pollId.addResource('responses').addMethod('POST', new apigateway.LambdaIntegration(submitResponseLambda), { authorizer: lambdaAuthorizer });
        // Invitations
        const invitations = api.root.addResource('invitations');
        invitations.addResource('send').addMethod('POST', new apigateway.LambdaIntegration(sendInvitationLambda), { authorizer: lambdaAuthorizer });
        invitations.addResource('accept').addMethod('POST', new apigateway.LambdaIntegration(acceptInvitationLambda), { authorizer: lambdaAuthorizer });
        // Expenses
        const expenses = api.root.addResource('expenses');
        expenses.addMethod('GET', new apigateway.LambdaIntegration(getExpensesLambda), { authorizer: lambdaAuthorizer });
        expenses.addMethod('POST', new apigateway.LambdaIntegration(createExpenseLambda), { authorizer: lambdaAuthorizer });
        // Settings
        const settings = api.root.addResource('settings');
        settings.addMethod('GET', new apigateway.LambdaIntegration(getSettingsLambda), { authorizer: lambdaAuthorizer });
        settings.addMethod('PUT', new apigateway.LambdaIntegration(updateSettingsLambda), { authorizer: lambdaAuthorizer });
        // Scheduled Lambdas
        new events.Rule(this, 'AutoCreateWeeklyPollSchedule', {
            schedule: events.Schedule.cron({ minute: '0', hour: '10', weekDay: 'MON' }),
            targets: [new targets.LambdaFunction(autoCreateWeeklyPollLambda)],
        });
        new events.Rule(this, 'FreezePollsSchedule', {
            schedule: events.Schedule.cron({ minute: '0', hour: '*', }),
            targets: [new targets.LambdaFunction(freezePollsLambda)],
        });
        new events.Rule(this, 'SendRemindersSchedule', {
            schedule: events.Schedule.cron({ minute: '0', hour: '18', weekDay: 'TUE' }),
            targets: [new targets.LambdaFunction(sendRemindersLambda)],
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
exports.BadmintonClubAppStack = BadmintonClubAppStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkbWludG9uLWNsdWItYXBwLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2luZnJhL2JhZG1pbnRvbi1jbHViLWFwcC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFFbkMsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUN6RCxxREFBcUQ7QUFDckQsaURBQWlEO0FBQ2pELDBEQUEwRDtBQUMxRCwyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBRTNDLE1BQWEscUJBQXNCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDbEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixrQkFBa0I7UUFDbEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDMUQsU0FBUyxFQUFFLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUTtZQUN6RSxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUNyRSxPQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDcEMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUN2QyxzQkFBc0IsRUFBRTtnQkFDdEI7b0JBQ0UsU0FBUyxFQUFFLFlBQVk7b0JBQ3ZCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO29CQUNwRSxjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHO2lCQUM1QzthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsTUFB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Q0FBQyxDQUFDO1NBQzNELENBQUMsQ0FBQztRQUVILFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzdDLEtBQUssRUFBRSxHQUFHLENBQUMsU0FBUztTQUNyQixDQUFDLENBQUM7UUFDSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGlDQUFpQyxFQUFFO1lBQ3pELEtBQUssRUFBRSxHQUFHLENBQUMscUJBQXFCO1NBQ2pDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXJPRCxzREFxT0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLWV2ZW50cyc7XG5pbXBvcnQgKiBhcyB0YXJnZXRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1ldmVudHMtdGFyZ2V0cyc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBzc20gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNzbSc7XG5cbmV4cG9ydCBjbGFzcyBCYWRtaW50b25DbHViQXBwU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBEeW5hbW9EQiBUYWJsZXNcbiAgICBjb25zdCB1c2Vyc1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlVjIodGhpcywgJ1VzZXJzVGFibGUnLCB7XG4gICAgICB0YWJsZU5hbWU6IGBiYWRtaW50b24tY2x1Yi1hcGktJHt0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnc3RhZ2UnKX0tdXNlcnNgLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICd1c2VySWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZzogZHluYW1vZGIuQmlsbGluZy5vbkRlbWFuZCgpLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgICAgZ2xvYmFsU2Vjb25kYXJ5SW5kZXhlczogW1xuICAgICAgICB7XG4gICAgICAgICAgaW5kZXhOYW1lOiAnRW1haWxJbmRleCcsXG4gICAgICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdlbWFpbCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICAgICAgcHJvamVjdGlvblR5cGU6IGR5bmFtb2RiLlByb2plY3Rpb25UeXBlLkFMTCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgY29uc3QgcG9sbHNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZVYyKHRoaXMsICdQb2xsc1RhYmxlJywge1xuICAgICAgdGFibGVOYW1lOiBgYmFkbWludG9uLWNsdWItYXBpLSR7dGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ3N0YWdlJyl9LXBvbGxzYCxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAncG9sbElkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmc6IGR5bmFtb2RiLkJpbGxpbmcub25EZW1hbmQoKSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICAgIGdsb2JhbFNlY29uZGFyeUluZGV4ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGluZGV4TmFtZTogJ1Nlc3Npb25EYXRlSW5kZXgnLFxuICAgICAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnc2Vzc2lvbkRhdGUnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICAgIHByb2plY3Rpb25UeXBlOiBkeW5hbW9kYi5Qcm9qZWN0aW9uVHlwZS5BTEwsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpbmRleE5hbWU6ICdTdGF0dXNJbmRleCcsXG4gICAgICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdzdGF0dXMnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ3Nlc3Npb25EYXRlJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgICBwcm9qZWN0aW9uVHlwZTogZHluYW1vZGIuUHJvamVjdGlvblR5cGUuQUxMLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICBjb25zdCByZXNwb25zZXNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZVYyKHRoaXMsICdSZXNwb25zZXNUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogYGJhZG1pbnRvbi1jbHViLWFwaS0ke3RoaXMubm9kZS50cnlHZXRDb250ZXh0KCdzdGFnZScpfS1yZXNwb25zZXNgLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdyZXNwb25zZUlkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmc6IGR5bmFtb2RiLkJpbGxpbmcub25EZW1hbmQoKSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICAgIGdsb2JhbFNlY29uZGFyeUluZGV4ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGluZGV4TmFtZTogJ1BvbGxJbmRleCcsXG4gICAgICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdwb2xsSWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ3VzZXJJZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICAgICAgcHJvamVjdGlvblR5cGU6IGR5bmFtb2RiLlByb2plY3Rpb25UeXBlLkFMTCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgY29uc3QgZXhwZW5zZXNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZVYyKHRoaXMsICdFeHBlbnNlc1RhYmxlJywge1xuICAgICAgdGFibGVOYW1lOiBgYmFkbWludG9uLWNsdWItYXBpLSR7dGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ3N0YWdlJyl9LWV4cGVuc2VzYCxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnZXhwZW5zZUlkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmc6IGR5bmFtb2RiLkJpbGxpbmcub25EZW1hbmQoKSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTixcbiAgICAgIGdsb2JhbFNlY29uZGFyeUluZGV4ZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGluZGV4TmFtZTogJ1Nlc3Npb25EYXRlSW5kZXgnLFxuICAgICAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnc2Vzc2lvbkRhdGUnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICAgIHByb2plY3Rpb25UeXBlOiBkeW5hbW9kYi5Qcm9qZWN0aW9uVHlwZS5BTEwsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICAgIGNvbnN0IGludml0YXRpb25zVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGVWMih0aGlzLCAnSW52aXRhdGlvbnNUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogYGJhZG1pbnRvbi1jbHViLWFwaS0ke3RoaXMubm9kZS50cnlHZXRDb250ZXh0KCdzdGFnZScpfS1pbnZpdGF0aW9uc2AsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2ludml0YXRpb25JZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBiaWxsaW5nOiBkeW5hbW9kYi5CaWxsaW5nLm9uRGVtYW5kKCksXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgICBnbG9iYWxTZWNvbmRhcnlJbmRleGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBpbmRleE5hbWU6ICdUb2tlbkluZGV4JyxcbiAgICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3Rva2VuJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgICBwcm9qZWN0aW9uVHlwZTogZHluYW1vZGIuUHJvamVjdGlvblR5cGUuQUxMLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaW5kZXhOYW1lOiAnRW1haWxJbmRleCcsXG4gICAgICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdlbWFpbCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICAgICAgcHJvamVjdGlvblR5cGU6IGR5bmFtb2RiLlByb2plY3Rpb25UeXBlLkFMTCxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgY29uc3QgY2x1YlNldHRpbmdzVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGVWMih0aGlzLCAnQ2x1YlNldHRpbmdzVGFibGUnLCB7XG4gICAgICB0YWJsZU5hbWU6IGBiYWRtaW50b24tY2x1Yi1hcGktJHt0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnc3RhZ2UnKX0tY2x1Yi1zZXR0aW5nc2AsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ3NldHRpbmdLZXknLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZzogZHluYW1vZGIuQmlsbGluZy5vbkRlbWFuZCgpLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGVudmlyb25tZW50IHZhcmlhYmxlc1xuICAgIGNvbnN0IGxhbWJkYUVudiA9IHtcbiAgICAgIFNUQUdFOiB0aGlzLm5vZGUudHJ5R2V0Q29udGV4dCgnc3RhZ2UnKSB8fCAnZGV2JyxcbiAgICAgIFJFR0lPTjogdGhpcy5yZWdpb24sXG4gICAgICBVU0VSU19UQUJMRTogdXNlcnNUYWJsZS50YWJsZU5hbWUsXG4gICAgICBQT0xMU19UQUJMRTogcG9sbHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICBSRVNQT05TRVNfVEFCTEU6IHJlc3BvbnNlc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIEVYUEVOU0VTX1RBQkxFOiBleHBlbnNlc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIElOVklUQVRJT05TX1RBQkxFOiBpbnZpdGF0aW9uc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIENMVUJfU0VUVElOR1NfVEFCTEU6IGNsdWJTZXR0aW5nc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIEpXVF9TRUNSRVQ6IHNzbS5TdHJpbmdQYXJhbWV0ZXIudmFsdWVGb3JTdHJpbmdQYXJhbWV0ZXIoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICBgL2JhZG1pbnRvbi1jbHViLyR7dGhpcy5ub2RlLnRyeUdldENvbnRleHQoJ3N0YWdlJykgfHwgJ2Rldid9L2p3dC1zZWNyZXRgXG4gICAgICApLFxuICAgIH07XG5cbiAgICAvLyBIZWxwZXIgdG8gY3JlYXRlIExhbWJkYSBmdW5jdGlvbnNcbiAgICBjb25zdCBjcmVhdGVMYW1iZGEgPSAoaWQ6IHN0cmluZywgaGFuZGxlcjogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBmbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgaWQsIHtcbiAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICAgIGhhbmRsZXIsXG4gICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnZGlzdCcpLFxuICAgICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IGxhbWJkYUVudixcbiAgICAgIH0pO1xuICAgICAgdXNlcnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZm4pO1xuICAgICAgcG9sbHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoZm4pO1xuICAgICAgcmVzcG9uc2VzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGZuKTtcbiAgICAgIGV4cGVuc2VzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGZuKTtcbiAgICAgIGludml0YXRpb25zVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGZuKTtcbiAgICAgIGNsdWJTZXR0aW5nc1RhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShmbik7XG4gICAgICAvLyBHcmFudCBTRVMsIFNOUywgRXZlbnRCcmlkZ2UgcGVybWlzc2lvbnNcbiAgICAgIGZuLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICBcInNlczpTZW5kRW1haWxcIixcbiAgICAgICAgICBcInNlczpTZW5kUmF3RW1haWxcIixcbiAgICAgICAgICBcInNuczpQdWJsaXNoXCIsXG4gICAgICAgICAgXCJldmVudHM6UHV0RXZlbnRzXCJcbiAgICAgICAgXSxcbiAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdXG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gZm47XG4gICAgfTtcblxuICAgIC8vIExhbWJkYSBGdW5jdGlvbnNcbiAgICBjb25zdCByZWdpc3RlckxhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnUmVnaXN0ZXJMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9hdXRoL3JlZ2lzdGVyLmhhbmRsZXInKTtcbiAgICBjb25zdCBsb2dpbkxhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnTG9naW5MYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9hdXRoL2xvZ2luLmhhbmRsZXInKTtcbiAgICBjb25zdCBnZXRQcm9maWxlTGFtYmRhID0gY3JlYXRlTGFtYmRhKCdHZXRQcm9maWxlTGFtYmRhJywgJ3NyYy9mdW5jdGlvbnMvdXNlcnMvZ2V0UHJvZmlsZS5oYW5kbGVyJyk7XG4gICAgY29uc3QgdXBkYXRlUHJvZmlsZUxhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnVXBkYXRlUHJvZmlsZUxhbWJkYScsICdzcmMvZnVuY3Rpb25zL3VzZXJzL3VwZGF0ZVByb2ZpbGUuaGFuZGxlcicpO1xuICAgIGNvbnN0IGdldE1lbWJlcnNMYW1iZGEgPSBjcmVhdGVMYW1iZGEoJ0dldE1lbWJlcnNMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy91c2Vycy9nZXRNZW1iZXJzLmhhbmRsZXInKTtcbiAgICBjb25zdCBnZXRDdXJyZW50UG9sbExhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnR2V0Q3VycmVudFBvbGxMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9wb2xscy9nZXRDdXJyZW50UG9sbC5oYW5kbGVyJyk7XG4gICAgY29uc3QgY3JlYXRlUG9sbExhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnQ3JlYXRlUG9sbExhbWJkYScsICdzcmMvZnVuY3Rpb25zL3BvbGxzL2NyZWF0ZVBvbGwuaGFuZGxlcicpO1xuICAgIGNvbnN0IHN1Ym1pdFJlc3BvbnNlTGFtYmRhID0gY3JlYXRlTGFtYmRhKCdTdWJtaXRSZXNwb25zZUxhbWJkYScsICdzcmMvZnVuY3Rpb25zL3BvbGxzL3N1Ym1pdFJlc3BvbnNlLmhhbmRsZXInKTtcbiAgICBjb25zdCBnZXRQb2xsSGlzdG9yeUxhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnR2V0UG9sbEhpc3RvcnlMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9wb2xscy9nZXRQb2xsSGlzdG9yeS5oYW5kbGVyJyk7XG4gICAgY29uc3Qgc2VuZEludml0YXRpb25MYW1iZGEgPSBjcmVhdGVMYW1iZGEoJ1NlbmRJbnZpdGF0aW9uTGFtYmRhJywgJ3NyYy9mdW5jdGlvbnMvaW52aXRhdGlvbnMvc2VuZEludml0YXRpb24uaGFuZGxlcicpO1xuICAgIGNvbnN0IGFjY2VwdEludml0YXRpb25MYW1iZGEgPSBjcmVhdGVMYW1iZGEoJ0FjY2VwdEludml0YXRpb25MYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9pbnZpdGF0aW9ucy9hY2NlcHRJbnZpdGF0aW9uLmhhbmRsZXInKTtcbiAgICBjb25zdCBnZXRFeHBlbnNlc0xhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnR2V0RXhwZW5zZXNMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9leHBlbnNlcy9nZXRFeHBlbnNlcy5oYW5kbGVyJyk7XG4gICAgY29uc3QgY3JlYXRlRXhwZW5zZUxhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnQ3JlYXRlRXhwZW5zZUxhbWJkYScsICdzcmMvZnVuY3Rpb25zL2V4cGVuc2VzL2NyZWF0ZUV4cGVuc2UuaGFuZGxlcicpO1xuICAgIGNvbnN0IGdldFNldHRpbmdzTGFtYmRhID0gY3JlYXRlTGFtYmRhKCdHZXRTZXR0aW5nc0xhbWJkYScsICdzcmMvZnVuY3Rpb25zL3NldHRpbmdzL2dldFNldHRpbmdzLmhhbmRsZXInKTtcbiAgICBjb25zdCB1cGRhdGVTZXR0aW5nc0xhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnVXBkYXRlU2V0dGluZ3NMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9zZXR0aW5ncy91cGRhdGVTZXR0aW5ncy5oYW5kbGVyJyk7XG4gICAgY29uc3QgYXV0b0NyZWF0ZVdlZWtseVBvbGxMYW1iZGEgPSBjcmVhdGVMYW1iZGEoJ0F1dG9DcmVhdGVXZWVrbHlQb2xsTGFtYmRhJywgJ3NyYy9mdW5jdGlvbnMvc2NoZWR1bGVkL2F1dG9DcmVhdGVXZWVrbHlQb2xsLmhhbmRsZXInKTtcbiAgICBjb25zdCBmcmVlemVQb2xsc0xhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnRnJlZXplUG9sbHNMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9zY2hlZHVsZWQvZnJlZXplUG9sbHMuaGFuZGxlcicpO1xuICAgIGNvbnN0IHNlbmRSZW1pbmRlcnNMYW1iZGEgPSBjcmVhdGVMYW1iZGEoJ1NlbmRSZW1pbmRlcnNMYW1iZGEnLCAnc3JjL2Z1bmN0aW9ucy9zY2hlZHVsZWQvc2VuZFJlbWluZGVycy5oYW5kbGVyJyk7XG4gICAgY29uc3QgYXV0aG9yaXplckxhbWJkYSA9IGNyZWF0ZUxhbWJkYSgnQXV0aG9yaXplckxhbWJkYScsICdzcmMvZnVuY3Rpb25zL2F1dGgvYXV0aG9yaXplci5oYW5kbGVyJyk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0JhZG1pbnRvbkNsdWJBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ0JhZG1pbnRvbiBDbHViIFNlcnZpY2UnLFxuICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICBzdGFnZU5hbWU6IGxhbWJkYUVudi5TVEFHRSxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIExhbWJkYSBBdXRob3JpemVyXG4gICAgY29uc3QgbGFtYmRhQXV0aG9yaXplciA9IG5ldyBhcGlnYXRld2F5LlRva2VuQXV0aG9yaXplcih0aGlzLCAnTGFtYmRhQXV0aG9yaXplcicsIHtcbiAgICAgIGhhbmRsZXI6IGF1dGhvcml6ZXJMYW1iZGEsXG4gICAgICBpZGVudGl0eVNvdXJjZTogYXBpZ2F0ZXdheS5JZGVudGl0eVNvdXJjZS5oZWFkZXIoJ0F1dGhvcml6YXRpb24nKSxcbiAgICB9KTtcblxuICAgIC8vIEF1dGggcm91dGVzXG4gICAgY29uc3QgYXV0aCA9IGFwaS5yb290LmFkZFJlc291cmNlKCdhdXRoJyk7XG4gICAgYXV0aC5hZGRSZXNvdXJjZSgncmVnaXN0ZXInKS5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihyZWdpc3RlckxhbWJkYSksIHsgYXV0aG9yaXphdGlvblR5cGU6IGFwaWdhdGV3YXkuQXV0aG9yaXphdGlvblR5cGUuTk9ORSB9KTtcbiAgICBhdXRoLmFkZFJlc291cmNlKCdsb2dpbicpLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGxvZ2luTGFtYmRhKSwgeyBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5OT05FIH0pO1xuXG4gICAgLy8gVXNlciByb3V0ZXNcbiAgICBjb25zdCB1c2VycyA9IGFwaS5yb290LmFkZFJlc291cmNlKCd1c2VycycpO1xuICAgIHVzZXJzLmFkZFJlc291cmNlKCdwcm9maWxlJykuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRQcm9maWxlTGFtYmRhKSwgeyBhdXRob3JpemVyOiBsYW1iZGFBdXRob3JpemVyIH0pO1xuICAgIHVzZXJzLmFkZFJlc291cmNlKCdwcm9maWxlJykuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1cGRhdGVQcm9maWxlTGFtYmRhKSwgeyBhdXRob3JpemVyOiBsYW1iZGFBdXRob3JpemVyIH0pO1xuICAgIHVzZXJzLmFkZFJlc291cmNlKCdtZW1iZXJzJykuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRNZW1iZXJzTGFtYmRhKSwgeyBhdXRob3JpemVyOiBsYW1iZGFBdXRob3JpemVyIH0pO1xuXG4gICAgLy8gUG9sbCByb3V0ZXNcbiAgICBjb25zdCBwb2xscyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdwb2xscycpO1xuICAgIHBvbGxzLmFkZFJlc291cmNlKCdjdXJyZW50JykuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRDdXJyZW50UG9sbExhbWJkYSksIHsgYXV0aG9yaXplcjogbGFtYmRhQXV0aG9yaXplciB9KTtcbiAgICBwb2xscy5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjcmVhdGVQb2xsTGFtYmRhKSwgeyBhdXRob3JpemVyOiBsYW1iZGFBdXRob3JpemVyIH0pO1xuICAgIHBvbGxzLmFkZFJlc291cmNlKCdoaXN0b3J5JykuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRQb2xsSGlzdG9yeUxhbWJkYSksIHsgYXV0aG9yaXplcjogbGFtYmRhQXV0aG9yaXplciB9KTtcbiAgICBjb25zdCBwb2xsSWQgPSBwb2xscy5hZGRSZXNvdXJjZSgne3BvbGxJZH0nKTtcbiAgICBwb2xsSWQuYWRkUmVzb3VyY2UoJ3Jlc3BvbnNlcycpLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHN1Ym1pdFJlc3BvbnNlTGFtYmRhKSwgeyBhdXRob3JpemVyOiBsYW1iZGFBdXRob3JpemVyIH0pO1xuXG4gICAgLy8gSW52aXRhdGlvbnNcbiAgICBjb25zdCBpbnZpdGF0aW9ucyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdpbnZpdGF0aW9ucycpO1xuICAgIGludml0YXRpb25zLmFkZFJlc291cmNlKCdzZW5kJykuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oc2VuZEludml0YXRpb25MYW1iZGEpLCB7IGF1dGhvcml6ZXI6IGxhbWJkYUF1dGhvcml6ZXIgfSk7XG4gICAgaW52aXRhdGlvbnMuYWRkUmVzb3VyY2UoJ2FjY2VwdCcpLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGFjY2VwdEludml0YXRpb25MYW1iZGEpLCB7IGF1dGhvcml6ZXI6IGxhbWJkYUF1dGhvcml6ZXIgfSk7XG5cbiAgICAvLyBFeHBlbnNlc1xuICAgIGNvbnN0IGV4cGVuc2VzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2V4cGVuc2VzJyk7XG4gICAgZXhwZW5zZXMuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihnZXRFeHBlbnNlc0xhbWJkYSksIHsgYXV0aG9yaXplcjogbGFtYmRhQXV0aG9yaXplciB9KTtcbiAgICBleHBlbnNlcy5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihjcmVhdGVFeHBlbnNlTGFtYmRhKSwgeyBhdXRob3JpemVyOiBsYW1iZGFBdXRob3JpemVyIH0pO1xuXG4gICAgLy8gU2V0dGluZ3NcbiAgICBjb25zdCBzZXR0aW5ncyA9IGFwaS5yb290LmFkZFJlc291cmNlKCdzZXR0aW5ncycpO1xuICAgIHNldHRpbmdzLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0U2V0dGluZ3NMYW1iZGEpLCB7IGF1dGhvcml6ZXI6IGxhbWJkYUF1dGhvcml6ZXIgfSk7XG4gICAgc2V0dGluZ3MuYWRkTWV0aG9kKCdQVVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1cGRhdGVTZXR0aW5nc0xhbWJkYSksIHsgYXV0aG9yaXplcjogbGFtYmRhQXV0aG9yaXplciB9KTtcblxuICAgIC8vIFNjaGVkdWxlZCBMYW1iZGFzXG4gICAgbmV3IGV2ZW50cy5SdWxlKHRoaXMsICdBdXRvQ3JlYXRlV2Vla2x5UG9sbFNjaGVkdWxlJywge1xuICAgICAgc2NoZWR1bGU6IGV2ZW50cy5TY2hlZHVsZS5jcm9uKHsgbWludXRlOiAnMCcsIGhvdXI6ICcxMCcsIHdlZWtEYXk6ICdNT04nIH0pLFxuICAgICAgdGFyZ2V0czogW25ldyB0YXJnZXRzLkxhbWJkYUZ1bmN0aW9uKGF1dG9DcmVhdGVXZWVrbHlQb2xsTGFtYmRhKV0sXG4gICAgfSk7XG4gICAgbmV3IGV2ZW50cy5SdWxlKHRoaXMsICdGcmVlemVQb2xsc1NjaGVkdWxlJywge1xuICAgICAgc2NoZWR1bGU6IGV2ZW50cy5TY2hlZHVsZS5jcm9uKHsgbWludXRlOiAnMCcsIGhvdXI6ICcqJywgfSksXG4gICAgICB0YXJnZXRzOiBbbmV3IHRhcmdldHMuTGFtYmRhRnVuY3Rpb24oZnJlZXplUG9sbHNMYW1iZGEpXSxcbiAgICB9KTtcbiAgICBuZXcgZXZlbnRzLlJ1bGUodGhpcywgJ1NlbmRSZW1pbmRlcnNTY2hlZHVsZScsIHtcbiAgICAgIHNjaGVkdWxlOiBldmVudHMuU2NoZWR1bGUuY3Jvbih7IG1pbnV0ZTogJzAnLCBob3VyOiAnMTgnLCB3ZWVrRGF5OiAnVFVFJyB9KSxcbiAgICAgIHRhcmdldHM6IFtuZXcgdGFyZ2V0cy5MYW1iZGFGdW5jdGlvbihzZW5kUmVtaW5kZXJzTGFtYmRhKV0sXG4gICAgfSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaUdhdGV3YXlSZXN0QXBpSWQnLCB7XG4gICAgICB2YWx1ZTogYXBpLnJlc3RBcGlJZCxcbiAgICB9KTtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpR2F0ZXdheVJlc3RBcGlSb290UmVzb3VyY2VJZCcsIHtcbiAgICAgIHZhbHVlOiBhcGkucmVzdEFwaVJvb3RSZXNvdXJjZUlkLFxuICAgIH0pO1xuICB9XG59Il19