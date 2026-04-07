import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../config/env', () => ({
    env: {
        JWT_SECRET: 'test-super-secret-key-minimum-16',
        JWT_EXPIRES_IN: '7d',
        NODE_ENV: 'test',
        PORT: 3333,
    },
}));

vi.mock('../modules/auth/auth.service');

import app from '../app';
import * as authService from '../modules/auth/auth.service';

describe('Auth routes – /api/auth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('POST /api/auth/register', () => {
        it('returns 400 when body is invalid', async () => {
            const res = await request(app).post('/api/auth/register').send({});

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('returns 409 when email is already taken', async () => {
            const err = Object.assign(new Error('Email already in use'), {
                code: 'EMAIL_TAKEN',
            });
            vi.mocked(authService.register).mockRejectedValueOnce(err);

            const res = await request(app).post('/api/auth/register').send({
                name: 'John',
                email: 'a@b.com',
                password: 'password123',
            });

            expect(res.status).toBe(409);
            expect(res.body.message).toBe('Email already in use');
        });

        it('returns 201 with user and token on success', async () => {
            const mockResult = {
                user: { id: 'u1', name: 'John', email: 'a@b.com', role: 'USER' },
                token: 'jwt.token.here',
            };
            vi.mocked(authService.register).mockResolvedValueOnce(mockResult as any);

            const res = await request(app).post('/api/auth/register').send({
                name: 'John',
                email: 'a@b.com',
                password: 'password123',
            });

            expect(res.status).toBe(201);
            expect(res.body.token).toBe('jwt.token.here');
            expect(res.body.user.email).toBe('a@b.com');
        });
    });

    // -------------------------------------------------------------------------
    describe('POST /api/auth/login', () => {
        it('returns 400 when body is invalid', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('returns 401 when credentials are wrong', async () => {
            vi.mocked(authService.login).mockRejectedValueOnce(
                new Error('Invalid credentials')
            );

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'a@b.com', password: 'wrong' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('returns 200 with user and token on success', async () => {
            const mockResult = {
                user: { id: 'u1', email: 'a@b.com', role: 'USER' },
                token: 'jwt.token.here',
            };
            vi.mocked(authService.login).mockResolvedValueOnce(mockResult as any);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'a@b.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    // -------------------------------------------------------------------------
    describe('POST /api/auth/forgot-password', () => {
        it('returns 400 when email is invalid', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'not-an-email' });

            expect(res.status).toBe(400);
        });

        it('returns 200 regardless of whether email exists', async () => {
            vi.mocked(authService.forgotPassword).mockResolvedValueOnce({
                message: 'If this email is registered, a reset link will be sent.',
            });

            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'any@b.com' });

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('If this email is registered');
        });
    });

    // -------------------------------------------------------------------------
    describe('POST /api/auth/reset-password', () => {
        it('returns 400 when token is missing', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ password: 'newpass123' });

            expect(res.status).toBe(400);
        });

        it('returns 400 when token is invalid or expired', async () => {
            vi.mocked(authService.resetPassword).mockRejectedValueOnce(
                new Error('Token invalid or expired')
            );

            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: 'bad-token', password: 'newpass123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Token invalid or expired');
        });

        it('returns 200 on successful password reset', async () => {
            vi.mocked(authService.resetPassword).mockResolvedValueOnce({
                message: 'Password updated successfully',
            });

            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({ token: 'valid-token', password: 'newpass123' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Password updated successfully');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /health', () => {
        it('returns 200 with status ok', async () => {
            const res = await request(app).get('/health');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
        });
    });
});
