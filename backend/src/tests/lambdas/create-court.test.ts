import { handler } from '../../app/lambdas/courts/create-court';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DatabaseService } from '../../app/data/database';
import { createSuccessResponse, createErrorResponse } from '../../app/utils/response';
import { getUserFromEvent } from '../../app/utils/auth';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

vi.mock('../../app/utils/database');
vi.mock('../../app/utils/response');
vi.mock('../../app/utils/auth');

describe('Create Court Lambda Handler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns success response when court is created successfully', async () => {
        const mockEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                name: 'Court 1',
                type: 'indoor',
                hourlyRate: 50,
                description: 'A great indoor court'
            }),
        } as any;

        (getUserFromEvent as unknown as Mock).mockReturnValue({ role: 'admin' });
        (DatabaseService.put as unknown as Mock).mockResolvedValue(undefined);
        (createSuccessResponse as unknown as Mock).mockReturnValue({ statusCode: 200 });

        const result = await handler(mockEvent);

        expect(result).toEqual({ statusCode: 200 });
        expect(DatabaseService.put).toHaveBeenCalled();
    });

    it('returns error response when request body is missing', async () => {
        const mockEvent: APIGatewayProxyEvent = {} as any;

        const result = await handler(mockEvent);

        expect(result).toEqual(createErrorResponse(400, 'Request body is required'));
    });

    it('returns error response when user is not admin', async () => {
        const mockEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                name: 'Court 1',
                type: 'indoor',
                hourlyRate: 50
            }),
        } as any;

        (getUserFromEvent as unknown as Mock).mockReturnValue({ role: 'user' });

        const result = await handler(mockEvent);

        expect(result).toEqual(createErrorResponse(403, 'Admin access required'));
    });

    it('returns error response when validation fails', async () => {
        const mockEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                name: '',
                type: 'indoor',
                hourlyRate: -10
            }),
        } as any;

        (getUserFromEvent as unknown as Mock).mockReturnValue({ role: 'admin' });

        const result = await handler(mockEvent);

        expect(result).toEqual(createErrorResponse(400, 'Validation error'));
    });

    it('returns error response for unexpected errors', async () => {
        const mockEvent: APIGatewayProxyEvent = {
            body: JSON.stringify({
                name: 'Court 1',
                type: 'indoor',
                hourlyRate: 50
            }),
        } as any;

        (getUserFromEvent as unknown as Mock).mockReturnValue({ role: 'admin' });
        (DatabaseService.put as unknown as Mock).mockRejectedValue(new Error('Unexpected error'));

        const result = await handler(mockEvent);

        expect(result).toEqual(createErrorResponse(500, 'Internal server error'));
    });
});