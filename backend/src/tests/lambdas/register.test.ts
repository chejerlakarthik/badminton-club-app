import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { handler } from '../../app/lambdas/auth/register';
import { hashPassword, generateToken } from '../../app/utils/auth';
import { EventService } from '../../app/utils/events';
import { DatabaseService } from '../../app/utils/database';


vi.mock('../../app/utils/database');
vi.mock('../../app/utils/auth');
vi.mock('../../app/utils/events');

const validBody = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '1234567890',
    membershipType: 'basic',
    skillLevel: 'beginner'
};

const event = {
    body: JSON.stringify(validBody)
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('register handler', () => {
    it('registers a new user successfully', async () => {
        (DatabaseService.query as any).mockResolvedValue([]);
        (hashPassword as any).mockResolvedValue('hashedPassword');
        (DatabaseService.put as any).mockResolvedValue(undefined);
        (generateToken as any).mockReturnValue('jwtToken');
        (EventService.publishUserEvent as any).mockResolvedValue(undefined);

        const res = await handler(event as any);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body).message).toBe('User registered successfully');
        expect(JSON.parse(res.body).data.token).toBe('jwtToken');
    });

    it('returns error if body is missing', async () => {
        const res = await handler({} as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('Request body is required');
    });

    it('returns error if user already exists', async () => {
        (DatabaseService.query as any).mockResolvedValue([{}]);
        const res = await handler(event as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('User already exists');
    });

    it('returns validation error for invalid input', async () => {
        const invalidEvent = { body: JSON.stringify({ ...validBody, email: 'not-an-email' }) };
        const res = await handler(invalidEvent as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toMatch(/email/);
    });

    it('returns internal server error on unexpected exception', async () => {
        (DatabaseService.query as any).mockImplementation(() => { throw new Error('DB error'); });
        const res = await handler(event as any);
        expect(res.statusCode).toBe(500);
        expect(JSON.parse(res.body).error).toBe('Internal server error');
    });
});

