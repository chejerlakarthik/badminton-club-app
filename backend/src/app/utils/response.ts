import { APIResponse } from '../types/entities.types';

export const createResponse = <T>(
    statusCode: number,
    data: T,
    message?: string
): APIResponse<T> => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
        body: JSON.stringify({
            success: statusCode < 400,
            message,
            data: statusCode < 400 ? data : undefined,
            error: statusCode >= 400 ? data : undefined,
        }),
    };
};

export const createSuccessResponse = <T>(data: T, message?: string): APIResponse<T> => {
    return createResponse(200, data, message);
};

export const createErrorResponse = (statusCode: number, error: string): APIResponse => {
    return createResponse(statusCode, error);
};