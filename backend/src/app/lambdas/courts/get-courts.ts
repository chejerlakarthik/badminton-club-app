import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { DatabaseService } from '../../utils/database';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const courts = await DatabaseService.query('COURT#');
        const activeCourts = courts.filter((court: any) => court.isActive);

        return createSuccessResponse(activeCourts);
    } catch (error) {
        console.error('Get courts error:', error);
        return createErrorResponse(500, 'Internal server error');
    }
};