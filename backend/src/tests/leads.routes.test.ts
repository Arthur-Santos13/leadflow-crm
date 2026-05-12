import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { LeadStatus } from '@prisma/client';

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

vi.mock('../modules/leads/leads.service');

import app from '../app';
import * as leadsService from '../modules/leads/leads.service';
import { userToken } from './helpers';

const AUTH = `Bearer ${userToken}`;
const VALID_UUID = '00000000-0000-4000-8000-000000000001';

describe('Leads routes – /api/leads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('Authentication guard', () => {
        it('returns 401 when no token is provided', async () => {
            const res = await request(app).get('/api/leads');
            expect(res.status).toBe(401);
        });
    });

    // -------------------------------------------------------------------------
    describe('POST /api/leads', () => {
        it('returns 400 when body is invalid', async () => {
            const res = await request(app)
                .post('/api/leads')
                .set('Authorization', AUTH)
                .send({ title: 'A' }); // title too short, missing customerId

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        });

        it('returns 404 when customer does not exist', async () => {
            const err = Object.assign(new Error('Customer not found'), {
                code: 'NOT_FOUND',
            });
            vi.mocked(leadsService.createLead).mockRejectedValueOnce(err);

            const res = await request(app)
                .post('/api/leads')
                .set('Authorization', AUTH)
                .send({ title: 'New Lead', customerId: VALID_UUID });

            expect(res.status).toBe(404);
        });

        it('returns 201 with created lead on success', async () => {
            const mockLead = { id: 'l1', title: 'New Lead', customerId: VALID_UUID };
            vi.mocked(leadsService.createLead).mockResolvedValueOnce(mockLead as any);

            const res = await request(app)
                .post('/api/leads')
                .set('Authorization', AUTH)
                .send({ title: 'New Lead', customerId: VALID_UUID });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe('New Lead');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/leads', () => {
        it('returns 200 with paginated list', async () => {
            vi.mocked(leadsService.listLeads).mockResolvedValueOnce({
                data: [{ id: 'l1', title: 'Lead A' }] as any,
                total: 1,
            });

            const res = await request(app).get('/api/leads').set('Authorization', AUTH);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body).toHaveProperty('meta');
        });
    });

    // -------------------------------------------------------------------------
    describe('GET /api/leads/:id', () => {
        it('returns 404 when lead does not exist', async () => {
            vi.mocked(leadsService.getLeadById).mockResolvedValueOnce(null);

            const res = await request(app)
                .get('/api/leads/nonexistent')
                .set('Authorization', AUTH);

            expect(res.status).toBe(404);
        });

        it('returns 200 with lead data when found', async () => {
            const mockLead = { id: 'l1', title: 'Lead A', customer: { id: 'c1' } };
            vi.mocked(leadsService.getLeadById).mockResolvedValueOnce(mockLead as any);

            const res = await request(app)
                .get('/api/leads/l1')
                .set('Authorization', AUTH);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe('l1');
        });
    });

    // -------------------------------------------------------------------------
    describe('PATCH /api/leads/:id/status', () => {
        it('returns 400 when status is invalid', async () => {
            const res = await request(app)
                .patch('/api/leads/l1/status')
                .set('Authorization', AUTH)
                .send({ status: 'INVALID_STATUS' });

            expect(res.status).toBe(400);
        });

        it('returns 404 when lead does not exist', async () => {
            const err = Object.assign(new Error('Lead not found'), { code: 'NOT_FOUND' });
            vi.mocked(leadsService.updateLeadStatus).mockRejectedValueOnce(err);

            const res = await request(app)
                .patch('/api/leads/nonexistent/status')
                .set('Authorization', AUTH)
                .send({ status: LeadStatus.QUALIFIED });

            expect(res.status).toBe(404);
        });

        it('returns 200 on successful status update', async () => {
            const mockLead = { id: 'l1', status: LeadStatus.QUALIFIED };
            vi.mocked(leadsService.updateLeadStatus).mockResolvedValueOnce(mockLead as any);

            const res = await request(app)
                .patch('/api/leads/l1/status')
                .set('Authorization', AUTH)
                .send({ status: LeadStatus.QUALIFIED });

            expect(res.status).toBe(200);
        });
    });

    // -------------------------------------------------------------------------
    describe('DELETE /api/leads/:id', () => {
        it('returns 409 when lead has attached deals', async () => {
            const err = Object.assign(
                new Error('Cannot delete lead with 1 deal(s) attached'),
                { code: 'HAS_RELATIONS' }
            );
            vi.mocked(leadsService.deleteLead).mockRejectedValueOnce(err);

            const res = await request(app)
                .delete('/api/leads/l1')
                .set('Authorization', AUTH);

            expect(res.status).toBe(409);
        });

        it('returns 204 on successful deletion', async () => {
            vi.mocked(leadsService.deleteLead).mockResolvedValueOnce(undefined);

            const res = await request(app)
                .delete('/api/leads/l1')
                .set('Authorization', AUTH);

            expect(res.status).toBe(204);
        });
    });
});
