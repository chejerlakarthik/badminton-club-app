import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { hashPassword, generateToken } from '../../utils/auth';
import { DatabaseService } from '../../utils/database';
import { EventService } from '../../utils/events';
import { User } from '../../types';
import log from 'lambda-log';

const RegisterSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().min(10),
    membershipType: z.enum(['basic', 'premium', 'student', 'family']).optional(),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional()
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    log.info('Register event received', { event });

    try {
        if (!event.body) {
            return createErrorResponse(400, 'Request body is required');
        }

        const body = JSON.parse(event.body);
        const validatedData = RegisterSchema.parse(body);

        // Check if a user already exists for the provided email
        const existingUser = await DatabaseService.query('USER#', validatedData.email);
        if (existingUser.length > 0) {
            return createErrorResponse(400, 'User already exists');
        }

        const userId = uuidv4();
        log.debug('Generated userId', { userId });

        const passwordHash = await hashPassword(validatedData.password);
        const now = new Date().toISOString();
        const membershipExpiry = new Date();
        membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1);

        const user: User = {
            PK: `USER#${userId}`,
            SK: `USER#${userId}`,
            userId,
            email: validatedData.email,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            passwordHash,
            membershipType: validatedData.membershipType || 'basic',
            membershipExpiry: membershipExpiry.toISOString(),
            skillLevel: validatedData.skillLevel || 'beginner',
            role: 'member',
            isActive: true,
            createdAt: now,
            updatedAt: now
        };

        await DatabaseService.put(user);

        // Generate JWT token
        const token = generateToken({
            userId: user.userId,
            email: user.email,
            role: user.role
        });

        // Publish user registration event
        await EventService.publishUserEvent('User Registered', {
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
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

        log.info('User created', { user: responseData.user });

        return createSuccessResponse(responseData, 'User registered successfully');
    } catch (error) {
        log.error('Registration error', { error });

        if (error instanceof z.ZodError) {
            return createErrorResponse(400, error.errors[0]?.message || 'Validation error');
        }

        return createErrorResponse(500, 'Internal server error');
    }
};