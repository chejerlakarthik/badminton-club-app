import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../utils/auth';
import { DatabaseService } from '../../utils/database';
import { Court } from '../../types';
import * as crypto from "node:crypto";

const CreateCourtSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['indoor', 'outdoor']),
    hourlyRate: z.number().positive(),
    description: z.string().optional()
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return createErrorResponse(400, 'Request body is required');
        }

        const user = getUserFromEvent(event);

        // Check if the user is admin
        if (user.role !== 'admin') {
            return createErrorResponse(403, 'Admin access required');
        }

        const body = JSON.parse(event.body);
        const courtData = CreateCourtSchema.parse(body);

        const courtId = crypto.randomUUID();
        const now = new Date().toISOString();

        const court: Court = {
            PK: `COURT#${courtId}`,
            SK: `COURT#${courtId}`,
            courtId,
            ...courtData,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            description: courtData.description ?? 'Court 8'
        };

        await DatabaseService.put(court);

        return createSuccessResponse(court, 'Court created successfully');
    } catch (error) {
        console.error('Create court error:', error);

        if (error instanceof z.ZodError) {
            return createErrorResponse(400, error.errors[0]?.message || 'Validation error');
        }

        if ((error as Error).message.includes('authorization')) {
            return createErrorResponse(401, (error as Error).message);
        }

        return createErrorResponse(500, 'Internal server error');
    }
};