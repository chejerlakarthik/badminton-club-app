import { APIGatewayProxyEvent } from 'aws-lambda';
export interface JWTPayload {
    userId: string;
    email: string;
    role: 'member' | 'admin';
}
export declare const JWT_SECRET: string;
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const extractTokenFromEvent: (event: APIGatewayProxyEvent) => string | null;
export declare const getUserFromEvent: (event: APIGatewayProxyEvent) => JWTPayload;
//# sourceMappingURL=auth.d.ts.map