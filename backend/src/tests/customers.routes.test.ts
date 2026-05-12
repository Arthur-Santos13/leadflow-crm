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

vi.mock('../modules/customers/customers.service');

import app from '../app';
import * as customersService from '../modules/customers/customers.service';
import { userToken } from './helpers';

const AUTH = `Bearer ${userToken}`;

describe('Customers routes – /api/customers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('Authentication guard', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).get('/api/customers');
            expect(res.status).toBe(401);
        });

        it('returns 401 when token is malformed', async () => {
            const res = await request(app)
                .get('/api/customers')
                .set('Authorization', 'Bearer bad.token');
            expect(res.status).toBe(401);
        });
    });

    // -------------------------------------------------------------------------
    describe('POST /api/customers', () => {
        it('returns 400 when body is invalid', async () => {
            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', AUTH)
                .send({ name: 'A' }); // name too short, missing email

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('returns 409 when email is already taken', async () => {
            const err = Object.assign(new Error('Email already in use'), {
                code: 'EMAIL_TAKEN',
            });
            vi.mocked(customersService.createCustomer).mockRejectedValueOnce(err);

            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', AUTH)
                .send({ name: 'ACME Corp', email: 'taken@b.com' });

            expect(res.status).toBe(409);
        });

        it('returns 201 with created customer on success', async () => {
            const mockCustomer = { id: 'c1', name: 'ACME Corp', email: 'acme@b.com' };
            vi.mocked(customersService.createCustomer).mockResolvedValueOnce(
                mockCustomer as any
            );

            const res = await request(app)
                .post('/api/customers')
                .set('Authorization', AUTH)
                .send({ name: 'ACME Corp', email: 'acme@b.com' });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe('acme@b.com');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/customers', () => {
        it('returns 200 with paginated list', async () => {
            vi.mocked(customersService.listCustomers).mockResolvedValueOnce({
                data: [{ id: 'c1', name: 'ACME' }] as any,
                total: 1,
            });

            const res = await request(app)
                .get('/api/customers')
                .set('Authorization', AUTH);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body).toHaveProperty('meta');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/customers/:id', () => {
        it('returns 404 when customer does not exist', async () => {
            vi.mocked(customersService.getCustomerById).mockResolvedValueOnce(null);

            const res = await request(app)
                .get('/api/customers/nonexistent')
                .set('Authorization', AUTH);

            expect(res.status).toBe(404);
        });

        it('returns 200 with customer data when found', async () => {
            const mockCustomer = { id: 'c1', name: 'ACME', email: 'acme@b.com' };
            vi.mocked(customersService.getCustomerById).mockResolvedValueOnce(
                mockCustomer as any
            );

            const res = await request(app)
                .get('/api/customers/c1')
                .set('Authorization', AUTH);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe('c1');
        });
    });

    // -------------------------------------------------------------------------
    describe('PATCH /api/customers/:id', () => {
        it('returns 400 when body fails validation', async () => {
            const res = await request(app)
                .patch('/api/customers/c1')
                .set('Authorization', AUTH)
                .send({ email: 'not-an-email' });

            expect(res.status).toBe(400);
        });

        it('returns 409 when updated email is already taken', async () => {
            const err = Object.assign(new Error('Email already in use'), {
                code: 'EMAIL_TAKEN',
            });
            vi.mocked(customersService.updateCustomer).mockRejectedValueOnce(err);

            const res = await request(app)
                .patch('/api/customers/c1')
                .set('Authorization', AUTH)
                .send({ email: 'taken@b.com' });

            expect(res.status).toBe(409);
        });

        it('returns 200 with updated customer on success', async () => {
            const mockCustomer = { id: 'c1', name: 'New Name', email: 'acme@b.com' };
            vi.mocked(customersService.updateCustomer).mockResolvedValueOnce(
                mockCustomer as any
            );

            const res = await request(app)
                .patch('/api/customers/c1')
                .set('Authorization', AUTH)
                .send({ name: 'New Name' });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe('New Name');
        });
    });

    // -------------------------------------------------------------------------
    describe('DELETE /api/customers/:id', () => {
        it('returns 409 when customer has related records', async () => {
            const err = Object.assign(
                new Error('Cannot delete customer with 1 lead(s) and 0 deal(s)'),
                { code: 'HAS_RELATIONS' }
            );
            vi.mocked(customersService.deleteCustomer).mockRejectedValueOnce(err);

            const res = await request(app)
                .delete('/api/customers/c1')
                .set('Authorization', AUTH);

            expect(res.status).toBe(409);
        });

        it('returns 204 on successful deletion', async () => {
            vi.mocked(customersService.deleteCustomer).mockResolvedValueOnce(undefined);

            const res = await request(app)
                .delete('/api/customers/c1')
                .set('Authorization', AUTH);

            expect(res.status).toBe(204);
        });
    });
});
