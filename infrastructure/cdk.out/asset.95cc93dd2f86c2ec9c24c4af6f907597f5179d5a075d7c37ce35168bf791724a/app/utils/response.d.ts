import { APIResponse } from '../types';
export declare const createResponse: <T>(statusCode: number, data: T, message?: string) => APIResponse<T>;
export declare const createSuccessResponse: <T>(data: T, message?: string) => APIResponse<T>;
export declare const createErrorResponse: (statusCode: number, error: string) => APIResponse;
//# sourceMappingURL=response.d.ts.map