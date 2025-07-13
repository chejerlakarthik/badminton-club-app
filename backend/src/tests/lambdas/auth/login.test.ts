import { describe, it, expect, vi } from 'vitest';
import { handler } from "../../../app/lambdas/auth/login";
import { DatabaseService } from "../../../app/utils/database";
import { comparePassword, generateToken } from "../../../app/utils/auth";

vi.mock('../../../app/utils/database');
vi.mock('../../../app/utils/auth');

describe('login handler', () => {
    it('returns success response for valid credentials', async () => {
        const event = {
            body: JSON.stringify({ email: 'john@example.com', password: 'password123' })
        };

        (DatabaseService.scan as any).mockResolvedValue([
            {
                userId: 'user123',
                email: 'john@example.com',
                passwordHash: 'hashedPassword',
                isActive: true,
                firstName: 'John',
                lastName: 'Doe',
                membershipType: 'basic',
                role: 'member'
            }
        ]);
        (comparePassword as any).mockResolvedValue(true);
        (generateToken as any).mockReturnValue('jwtToken');

        const res = await handler(event as any);

        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body).message).toBe('Login successful');
        expect(JSON.parse(res.body).data.token).toBe('jwtToken');
    });

    it('returns error if body is missing', async () => {
        const res = await handler({} as any);

        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('Request body is required');
    });

    it('returns error for invalid credentials', async () => {
        const event = {
            body: JSON.stringify({ email: 'john@example.com', password: 'wrongPassword' })
        };

        (DatabaseService.scan as any).mockResolvedValue([
            {
                userId: 'user123',
                email: 'john@example.com',
                passwordHash: 'hashedPassword',
                isActive: true
            }
        ]);
        (comparePassword as any).mockResolvedValue(false);

        const res = await handler(event as any);

        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('Invalid credentials');
    });

    it('returns error if user is not active', async () => {
        const event = {
            body: JSON.stringify({ email: 'john@example.com', password: 'password123' })
        };

        (DatabaseService.scan as any).mockResolvedValue([
            {
                userId: 'user123',
                email: 'john@example.com',
                passwordHash: 'hashedPassword',
                isActive: false
            }
        ]);
        (comparePassword as any).mockResolvedValue(true);

        const res = await handler(event as any);

        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toBe('Account is deactivated');
    });

    it('returns validation error for invalid input', async () => {
        const event = {
            body: JSON.stringify({ email: 'not-an-email', password: '' })
        };

        const res = await handler(event as any);

        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body).error).toMatch(/email/);
    });

    it('returns internal server error on unexpected exception', async () => {
        const event = {
            body: JSON.stringify({ email: 'john@example.com', password: 'password123' })
        };

        (DatabaseService.scan as any).mockImplementation(() => {
            throw new Error('DB error');
        });

        const res = await handler(event as any);

        expect(res.statusCode).toBe(500);
        expect(JSON.parse(res.body).error).toBe('Internal server error');
    });
});