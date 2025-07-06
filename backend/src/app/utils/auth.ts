import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { APIGatewayProxyEvent } from 'aws-lambda';

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'member' | 'admin';
}

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const extractTokenFromEvent = (event: APIGatewayProxyEvent): string | null => {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

    return parts[1] || null ;
};

export const getUserFromEvent = (event: APIGatewayProxyEvent): JWTPayload => {
    const token = extractTokenFromEvent(event);
    if (!token) {
        throw new Error('No authorization token provided');
    }

    try {
        return verifyToken(token);
    } catch (error) {
        throw new Error('Invalid authorization token');
    }
};