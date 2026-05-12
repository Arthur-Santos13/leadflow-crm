import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { DealStage } from '@prisma/client';

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

vi.mock('../modules/deals/deals.service');

import app from '../app';
import * as dealsService from '../modules/deals/deals.service';
import { userToken, adminToken } from './helpers';

const AUTH = `Bearer ${userToken}`;
const ADMIN_AUTH = `Bearer ${adminToken}`;
const VALID_UUID = '00000000-0000-4000-8000-000000000001';

describe('Deals routes – /api/deals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('Authentication guard', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).get('/api/deals');
            expect(res.status).toBe(401);
        });
    });

    // -------------------------------------------------------------------------
    describe('POST /api/deals', () => {
        it('returns 400 when body is invalid', async () => {
            const res = await request(app)
                .post('/api/deals')
                .set('Authorization', AUTH)
                .send({ title: '' }); // empty title, missing customerId

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('returns 404 when customer does not exist', async () => {
            const err = Object.assign(new Error('Customer not found'), {
                code: 'NOT_FOUND',
            });
            vi.mocked(dealsService.createDeal).mockRejectedValueOnce(err);

            const res = await request(app)
                .post('/api/deals')
                .set('Authorization', AUTH)
                .send({ title: 'New Deal', customerId: VALID_UUID });

            expect(res.status).toBe(404);
        });

        it('returns 201 with created deal on success', async () => {
            const mockDeal = { id: 'd1', title: 'New Deal', customerId: VALID_UUID };
            vi.mocked(dealsService.createDeal).mockResolvedValueOnce(mockDeal as any);

            const res = await request(app)
                .post('/api/deals')
                .set('Authorization', AUTH)
                .send({ title: 'New Deal', customerId: VALID_UUID });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New Deal');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/deals', () => {
        it('returns 200 with paginated list', async () => {
            vi.mocked(dealsService.listDeals).mockResolvedValueOnce({
                data: [{ id: 'd1', title: 'Deal A' }] as any,
                total: 1,
            });

            const res = await request(app).get('/api/deals').set('Authorization', AUTH);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body).toHaveProperty('meta');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/deals/:id', () => {
        it('returns 404 when deal does not exist', async () => {
            vi.mocked(dealsService.getDealById).mockResolvedValueOnce(null);

            const res = await request(app)
                .get('/api/deals/nonexistent')
                .set('Authorization', AUTH);

            expect(res.status).toBe(404);
        });

        it('returns 200 with deal data when found', async () => {
            const mockDeal = { id: 'd1', title: 'Deal A', customer: {}, lead: null };
            vi.mocked(dealsService.getDealById).mockResolvedValueOnce(mockDeal as any);

            const res = await request(app)
                .get('/api/deals/d1')
                .set('Authorization', AUTH);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe('d1');
        });
    });

    // -------------------------------------------------------------------------
    describe('PATCH /api/deals/:id', () => {
        it('returns 404 when deal does not exist', async () => {
            const err = Object.assign(new Error('Deal not found'), { code: 'NOT_FOUND' });
            vi.mocked(dealsService.updateDeal).mockRejectedValueOnce(err);

            const res = await request(app)
                .patch('/api/deals/nonexistent')
                .set('Authorization', AUTH)
                .send({ title: 'Updated' });

            expect(res.status).toBe(404);
        });

        it('returns 200 with updated deal on success', async () => {
            const mockDeal = { id: 'd1', title: 'Updated' };
            vi.mocked(dealsService.updateDeal).mockResolvedValueOnce(mockDeal as any);

            const res = await request(app)
                .patch('/api/deals/d1')
                .set('Authorization', AUTH)
                .send({ title: 'Updated' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated');
        });
    });

    // -------------------------------------------------------------------------
    describe('PATCH /api/deals/:id/stage', () => {
        it('returns 400 when stage is invalid', async () => {
            const res = await request(app)
                .patch('/api/deals/d1/stage')
                .set('Authorization', AUTH)
                .send({ stage: 'INVALID_STAGE' });

            expect(res.status).toBe(400);
        });

        it('returns 404 when deal does not exist', async () => {
            const err = Object.assign(new Error('Deal not found'), { code: 'NOT_FOUND' });
            vi.mocked(dealsService.updateDealStage).mockRejectedValueOnce(err);

            const res = await request(app)
                .patch('/api/deals/nonexistent/stage')
                .set('Authorization', AUTH)
                .send({ stage: DealStage.PROPOSAL });

            expect(res.status).toBe(404);
        });

        it('returns 200 on successful stage update', async () => {
            const mockDeal = { id: 'd1', stage: DealStage.CLOSED_WON };
            vi.mocked(dealsService.updateDealStage).mockResolvedValueOnce(mockDeal as any);

            const res = await request(app)
                .patch('/api/deals/d1/stage')
                .set('Authorization', AUTH)
                .send({ stage: DealStage.CLOSED_WON });

            expect(res.status).toBe(200);
        });
    });

    // -------------------------------------------------------------------------
    describe('DELETE /api/deals/:id (ADMIN only)', () => {
        it('returns 403 when user role is not ADMIN', async () => {
            const res = await request(app)
                .delete('/api/deals/d1')
                .set('Authorization', AUTH); // regular user token

            expect(res.status).toBe(403);
        });

        it('returns 404 when deal does not exist (ADMIN)', async () => {
            const err = Object.assign(new Error('Deal not found'), { code: 'NOT_FOUND' });
            vi.mocked(dealsService.deleteDeal).mockRejectedValueOnce(err);

            const res = await request(app)
                .delete('/api/deals/nonexistent')
                .set('Authorization', ADMIN_AUTH);

            expect(res.status).toBe(404);
        });

        it('returns 204 on successful deletion (ADMIN)', async () => {
            vi.mocked(dealsService.deleteDeal).mockResolvedValueOnce({} as any);

            const res = await request(app)
                .delete('/api/deals/d1')
                .set('Authorization', ADMIN_AUTH);

            expect(res.status).toBe(204);
        });
    });
});
