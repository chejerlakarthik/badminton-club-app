import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handler } from '../../../app/lambdas/auth/register';
import { hashPassword, generateToken } from '../../../app/utils/auth';
import { EventService } from '../../../app/utils/events';
import { DatabaseService } from '../../../app/data/database';

// Mock the modules
vi.mock('../../../app/data/database');
vi.mock('../../../app/utils/auth');
vi.mock('../../../app/utils/events');
vi.mock('lambda-log', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
    }
}));
vi.mock('node:crypto', () => ({
    randomUUID: vi.fn(() => 'test-uuid-123')
}));

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
        vi.mocked(DatabaseService.query).mockResolvedValue([]);
        vi.mocked(hashPassword).mockResolvedValue('hashedPassword');
        vi.mocked(DatabaseService.put).mockResolvedValue(undefined);
        vi.mocked(generateToken).mockReturnValue('jwtToken');
        vi.mocked(EventService.publishUserEvent).mockResolvedValue(undefined);

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
        vi.mocked(DatabaseService.query).mockResolvedValue([{ userId: 'existing-user' }]);
        const res = await handler(event as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('User already exists');
    });

    it('returns validation error for invalid input', async () => {
        const invalidEvent = { body: JSON.stringify({ ...validBody, email: 'not-an-email' }) };
        const res = await handler(invalidEvent as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('Invalid input data');
    });

    it('returns internal server error on unexpected exception', async () => {
        vi.mocked(DatabaseService.query).mockImplementation(() => { throw new Error('DB error'); });
        const res = await handler(event as any);
        expect(res.statusCode).toBe(500);
        expect(JSON.parse(res.body).error).toBe('Internal server error');
    });
});

