import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const docClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = process.env.MAIN_TABLE || 'BadmintonClubTable';

export class DatabaseService {
    static async get(PK: string, SK: string) {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK, SK }
        });

        const result = await docClient.send(command);
        return result.Item;
    }

    static async put(item: any) {
        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        });

        await docClient.send(command);
        return item;
    }

    static async update(PK: string, SK: string, updates: any) {
        const updateExpression = Object.keys(updates)
            .map(key => `#${key} = :${key}`)
            .join(', ');

        const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
            acc[`#${key}`] = key;
            return acc;
        }, {} as Record<string, string>);

        const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => {
            acc[`:${key}`] = updates[key];
            return acc;
        }, {} as Record<string, any>);

        const command = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK, SK },
            UpdateExpression: `SET ${updateExpression}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        });

        const result = await docClient.send(command);
        return result.Attributes;
    }

    static async delete(PK: string, SK: string) {
        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK, SK }
        });

        await docClient.send(command);
    }

    static async query(PK: string, SK?: string, indexName?: string) {
        const keyConditionExpression = SK
            ? 'PK = :pk AND begins_with(SK, :sk)'
            : 'PK = :pk';

        const expressionAttributeValues: any = { ':pk': PK };
        if (SK) {
            expressionAttributeValues[':sk'] = SK;
        }

        const command = new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues
        });

        const result = await docClient.send(command);
        return result.Items || [];
    }

    static async queryGSI(gsiPK: string, gsiSK?: string, indexName: string = 'GSI1') {
        const keyConditionExpression = gsiSK
            ? `${indexName}PK = :gsiPK AND begins_with(${indexName}SK, :gsiSK)`
            : `${indexName}PK = :gsiPK`;

        const expressionAttributeValues: any = { ':gsiPK': gsiPK };
        if (gsiSK) {
            expressionAttributeValues[':gsiSK'] = gsiSK;
        }

        const command = new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues
        });

        const result = await docClient.send(command);
        return result.Items || [];
    }

    static async scan(filterExpression?: string, expressionAttributeValues?: any) {
        const command = new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: filterExpression,
            ExpressionAttributeValues: expressionAttributeValues
        });

        const result = await docClient.send(command);
        return result.Items || [];
    }
}