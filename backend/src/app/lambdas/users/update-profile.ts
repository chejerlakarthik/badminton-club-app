import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../utils/auth';
import { DatabaseService } from '../../utils/database';

const UpdateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional()
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return createErrorResponse(400, 'Request body is required');
        }

        const user = getUserFromEvent(event);
        const body = JSON.parse(event.body);
        const updates = UpdateProfileSchema.parse(body);

        const updatedUser = await DatabaseService.update(
            `USER#${user.userId}`,
            `USER#${user.userId}`,
            {
                ...updates,
                updatedAt: new Date().toISOString()
            }
        );

        // Remove sensitive data
        // @ts-ignore
        const { passwordHash, ...safeUserData } = updatedUser;

        return createSuccessResponse(safeUserData, 'Profile updated successfully');
    } catch (error) {
        console.error('Update profile error:', error);

        if (error instanceof z.ZodError) {
            return createErrorResponse(400, error.errors[0]?.message || 'Validation error');
        }

        if ((error as Error).message.includes('authorization')) {
            return createErrorResponse(401, (error as Error).message);
        }

        return createErrorResponse(500, 'Internal server error');
    }
};