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
        vi.mocked(DatabaseService.queryGSI).mockResolvedValue([]);
        vi.mocked(hashPassword).mockResolvedValue('hashedPassword');
        vi.mocked(DatabaseService.put).mockResolvedValue(undefined);
        vi.mocked(generateToken).mockReturnValue('jwtToken');
        vi.mocked(EventService.publishUserEvent).mockResolvedValue(undefined);

        const res = await handler(event as any);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body).message).toBe('User registered successfully');
        expect(JSON.parse(res.body).data.token).toBe('jwtToken');
        expect(DatabaseService.queryGSI).toHaveBeenCalledWith(`EMAIL#${validBody.email}`, undefined, 'GSI1');
        expect(DatabaseService.queryGSI).toHaveBeenCalledWith(`PHONE#${validBody.phone}`, undefined, 'GSI2');
    });

    it('returns error if body is missing', async () => {
        const res = await handler({} as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('Request body is required');
    });

    it('returns error if user with email already exists', async () => {
        vi.mocked(DatabaseService.queryGSI)
            .mockResolvedValueOnce([{ userId: 'existing-user' }]) // Email check returns existing user
            .mockResolvedValueOnce([]); // Phone check returns empty
        const res = await handler(event as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('A user with this email address already exists');
    });

    it('returns error if user with phone already exists', async () => {
        // Create fresh mock setup
        const queryGSIMock = vi.mocked(DatabaseService.queryGSI);
        queryGSIMock.mockReset();
        queryGSIMock
            .mockResolvedValueOnce([]) // First call (email check) returns empty
            .mockResolvedValueOnce([{ userId: 'existing-user' }]); // Second call (phone check) returns existing user
        
        const res = await handler(event as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('A user with this phone number already exists');
        
        // Verify the right calls were made
        expect(queryGSIMock).toHaveBeenCalledTimes(2);
        expect(queryGSIMock).toHaveBeenNthCalledWith(1, `EMAIL#${validBody.email}`, undefined, 'GSI1');
        expect(queryGSIMock).toHaveBeenNthCalledWith(2, `PHONE#${validBody.phone}`, undefined, 'GSI2');
    });

    it('returns validation error for invalid input', async () => {
        const invalidEvent = { body: JSON.stringify({ ...validBody, email: 'not-an-email' }) };
        const res = await handler(invalidEvent as any);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('Invalid input data');
    });

    it('returns internal server error on unexpected exception', async () => {
        const queryGSIMock = vi.mocked(DatabaseService.queryGSI);
        queryGSIMock.mockReset();
        queryGSIMock.mockRejectedValueOnce(new Error('DB error'));
        
        const res = await handler(event as any);
        expect(res.statusCode).toBe(500);
        expect(JSON.parse(res.body).error).toBe('Internal server error');
    });
});

