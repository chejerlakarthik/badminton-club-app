import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { hashPassword, generateToken } from '../../utils/auth';
import { DatabaseService } from '../../data/database';
import { EventService } from '../../utils/events';
import { DynamoUser } from '../../data/model.types';
import log from 'lambda-log';
import { randomUUID } from "node:crypto";

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

    log.info(`Register event received`, { payload: event.body });

    try {
        if (!event.body) {
            return createErrorResponse(400, 'Request body is required');
        }

        const body = JSON.parse(event.body);
        const parseAttempt = RegisterSchema.safeParse(body);

        if (!parseAttempt.success) {
            log.error('Validation failed', {errors: parseAttempt.error.errors});
            return createErrorResponse(400, 'Invalid input data');
        }

        const validatedData = parseAttempt.data;

        // Check if a user already exists with the provided email
        const existingUserByEmail = await DatabaseService.queryGSI(`EMAIL#${validatedData.email}`, undefined, 'GSI1');
        if (existingUserByEmail.length > 0) {
            return createErrorResponse(400, 'A user with this email address already exists');
        }

        // Check if a user already exists with the provided phone number
        const existingUserByPhone = await DatabaseService.queryGSI(`PHONE#${validatedData.phone}`, undefined, 'GSI2');
        if (existingUserByPhone.length > 0) {
            return createErrorResponse(400, 'A user with this phone number already exists');
        }

        const userId = randomUUID();
        log.debug('Generated userId', { userId });

        const passwordHash = await hashPassword(validatedData.password);
        const now = new Date().toISOString();
        const membershipExpiry = new Date();
        membershipExpiry.setFullYear(membershipExpiry.getFullYear() + 1);

        const user: DynamoUser = {
            PK: `USER#${userId}`,
            SK: `USER#${userId}`,
            GSI1PK: `EMAIL#${validatedData.email}`,
            GSI1SK: `USER#${userId}`,
            GSI2PK: `PHONE#${validatedData.phone}`,
            GSI2SK: `USER#${userId}`,
            userId,
            email: validatedData.email,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            passwordHash,
            membershipType: validatedData.membershipType || 'basic',
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

        log.info('User registered successfully', { user: responseData.user });

        return createSuccessResponse(responseData, 'User registered successfully');
    } catch (error) {
        log.error('Registration error', { error });

        if (error instanceof z.ZodError) {
            return createErrorResponse(400, error.errors[0]?.message || 'Validation error');
        }

        return createErrorResponse(500, 'Internal server error');
    }
};