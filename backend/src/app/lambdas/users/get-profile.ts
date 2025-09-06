import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../utils/auth';
import { DatabaseService } from '../../data/database';
import { DynamoUser } from '../../data/model.types';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const user = getUserFromEvent(event);

        const userData = await DatabaseService.get(`USER#${user.userId}`, `USER#${user.userId}`) as DynamoUser;

        if (!userData) {
            return createErrorResponse(404, 'User not found');
        }

        // Remove sensitive data
        const { passwordHash, ...safeUserData } = userData;

        return createSuccessResponse(safeUserData);
    } catch (error) {
        console.error('Get profile error:', error);

        if ((error as Error).message.includes('authorization')) {
            return createErrorResponse(401, (error as Error).message);
        }

        return createErrorResponse(500, 'Internal server error');
    }
};