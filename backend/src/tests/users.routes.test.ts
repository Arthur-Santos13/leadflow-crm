import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../config/env', () => ({
    env: {
        JWT_SECRET: 'test-super-secret-key-minimum-16',
        JWT_EXPIRES_IN: '7d',
        NODE_ENV: 'test',
        PORT: 3333,
        DATABASE_URL: 'postgresql://test:test@127.0.0.1:5432/test',
        DATABASE_URL_UNPOOLED: 'postgresql://test:test@127.0.0.1:5432/test',
    },
}));

vi.mock('../modules/users/users.service');

import app from '../app';
import * as usersService from '../modules/users/users.service';
import { prisma } from '../lib/prisma';
import { adminToken, userToken } from './helpers';

const ADMIN_AUTH = `Bearer ${adminToken}`;
const AGENT_AUTH = `Bearer ${userToken}`;

describe('Users routes – /api/users', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('Authentication guard', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).get('/api/users');
            expect(res.status).toBe(401);
        });

        it('returns 401 when token is malformed', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer bad.token');
            expect(res.status).toBe(401);
        });
    });

    // -------------------------------------------------------------------------
    describe('Authorization guard', () => {
        it('returns 403 when user is not ADMIN', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', AGENT_AUTH);
            expect(res.status).toBe(403);
        });

        it('returns 403 on PATCH when user is not ADMIN', async () => {
            const res = await request(app)
                .patch('/api/users/u2/role')
                .set('Authorization', AGENT_AUTH)
                .send({ role: 'AGENT' });
            expect(res.status).toBe(403);
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/users', () => {
        it('returns 200 with list of users for ADMIN', async () => {
            const mockUsers = [
                { id: 'u1', name: 'Alice', email: 'alice@b.com', role: 'ADMIN' },
                { id: 'u2', name: 'Bob', email: 'bob@b.com', role: 'AGENT' },
            ];
            vi.mocked(usersService.listUsers).mockResolvedValueOnce(mockUsers as any);

            const res = await request(app)
                .get('/api/users')
                .set('Authorization', ADMIN_AUTH);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(2);
        });
    });

    // -------------------------------------------------------------------------
    describe('PATCH /api/users/:id/role', () => {
        it('returns 400 when role value is invalid', async () => {
            const res = await request(app)
                .patch('/api/users/u2/role')
                .set('Authorization', ADMIN_AUTH)
                .send({ role: 'SUPERUSER' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('returns 400 when admin tries to change their own role', async () => {
            const err = Object.assign(new Error('Cannot change your own role'), {
                code: 'SELF_ROLE_CHANGE',
            });
            vi.mocked(usersService.updateUserRole).mockRejectedValueOnce(err);

            const res = await request(app)
                .patch('/api/users/admin-user-id/role')
                .set('Authorization', ADMIN_AUTH)
                .send({ role: 'AGENT' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Cannot change your own role');
        });

        it('returns 404 when target user does not exist', async () => {
            const err = Object.assign(new Error('User not found'), {
                code: 'NOT_FOUND',
            });
            vi.mocked(usersService.updateUserRole).mockRejectedValueOnce(err);

            const res = await request(app)
                .patch('/api/users/nonexistent/role')
                .set('Authorization', ADMIN_AUTH)
                .send({ role: 'AGENT' });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found');
        });

        it('returns 200 with updated user on success', async () => {
            const mockUser = { id: 'u2', name: 'Bob', email: 'bob@b.com', role: 'ADMIN' };
            vi.mocked(usersService.updateUserRole).mockResolvedValueOnce(mockUser as any);

            const res = await request(app)
                .patch('/api/users/u2/role')
                .set('Authorization', ADMIN_AUTH)
                .send({ role: 'ADMIN' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.role).toBe('ADMIN');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/users/me', () => {
        it('returns 200 with current user for any authenticated user', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
                id: 'regular-user-id',
                name: 'Bob',
                email: 'bob@b.com',
                role: 'AGENT',
                createdAt: new Date('2020-01-01'),
            } as any);

            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', AGENT_AUTH);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('user');
        });
    });
});
