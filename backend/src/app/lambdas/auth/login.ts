import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { comparePassword, generateToken } from '../../utils/auth';
import { DatabaseService } from '../../data/database';
import { DynamoUser } from '../../data/model.types';

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return createErrorResponse(400, 'Request body is required');
        }
        const body = JSON.parse(event.body);
        const parseResult = LoginSchema.safeParse(body);

        if (!parseResult.success) {
            return createErrorResponse(400, 'Bad request');
        }

        const { email, password } = parseResult.data;

        // Find user by email (scan operation - in production, consider using GSI)
        const users = await DatabaseService.scan(
            'email = :email',
            { ':email': email }
        );

        if (users.length === 0) {
            return createErrorResponse(400, 'Invalid credentials');
        }

        const user = users[0] as DynamoUser;

        // Check password
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            return createErrorResponse(400, 'Invalid credentials');
        }

        // Check if account is active
        if (!user.isActive) {
            return createErrorResponse(400, 'Account is deactivated');
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.userId,
            email: user.email,
            role: user.role
        });

        const responseData = {
            token,
            user: {
                id: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                membershipType: user.membershipType,
                role: user.role
            }
        };

        return createSuccessResponse(responseData, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);

        if (error instanceof z.ZodError) {
            return createErrorResponse(400, error.errors[0]?.message || 'Validation error');
        }

        return createErrorResponse(500, 'Internal server error');
    }
};