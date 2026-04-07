import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DealStage } from '@prisma/client';
import { prisma } from '../lib/prisma';
import * as dealsService from '../modules/deals/deals.service';

describe('deals.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('createDeal', () => {
        it('throws NOT_FOUND when customer does not exist', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(null);

            await expect(
                dealsService.createDeal({
                    title: 'Deal A',
                    customerId: 'c-uuid',
                    stage: DealStage.PROSPECTING,
                })
            ).rejects.toMatchObject({ message: 'Customer not found', code: 'NOT_FOUND' });

            expect(prisma.deal.create).not.toHaveBeenCalled();
        });

        it('throws NOT_FOUND when leadId is provided but lead does not exist', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c-uuid',
            } as any);
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce(null);

            await expect(
                dealsService.createDeal({
                    title: 'Deal A',
                    customerId: 'c-uuid',
                    leadId: 'l-uuid',
                    stage: DealStage.PROSPECTING,
                })
            ).rejects.toMatchObject({ message: 'Lead not found', code: 'NOT_FOUND' });

            expect(prisma.deal.create).not.toHaveBeenCalled();
        });

        it('creates deal successfully without a leadId', async () => {
            const mockDeal = { id: 'd1', title: 'Deal A', customerId: 'c-uuid' };
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c-uuid',
            } as any);
            vi.mocked(prisma.deal.create).mockResolvedValueOnce(mockDeal as any);

            const result = await dealsService.createDeal({
                title: 'Deal A',
                customerId: 'c-uuid',
                stage: DealStage.PROSPECTING,
            });

            expect(result).toEqual(mockDeal);
            expect(prisma.lead.findUnique).not.toHaveBeenCalled();
        });

        it('creates deal successfully with a valid leadId', async () => {
            const mockDeal = { id: 'd1', title: 'Deal A', customerId: 'c-uuid', leadId: 'l-uuid' };
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c-uuid',
            } as any);
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce({ id: 'l-uuid' } as any);
            vi.mocked(prisma.deal.create).mockResolvedValueOnce(mockDeal as any);

            const result = await dealsService.createDeal({
                title: 'Deal A',
                customerId: 'c-uuid',
                leadId: 'l-uuid',
                stage: DealStage.PROSPECTING,
            });

            expect(result).toEqual(mockDeal);
        });
    });

    // -------------------------------------------------------------------------
    describe('listDeals', () => {
        it('returns paginated data and total count', async () => {
            const mockData = [{ id: 'd1', title: 'Deal A' }];
            vi.mocked(prisma.deal.findMany).mockResolvedValueOnce(mockData as any);
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(1);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            const result = await dealsService.listDeals(pagination, {});

            expect(result.data).toEqual(mockData);
            expect(result.total).toBe(1);
        });

        it('applies stage filter to the query', async () => {
            vi.mocked(prisma.deal.findMany).mockResolvedValueOnce([] as any);
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(0);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            await dealsService.listDeals(pagination, { stage: DealStage.PROPOSAL });

            const findManyCall = vi.mocked(prisma.deal.findMany).mock.calls[0][0];
            expect(findManyCall?.where).toMatchObject({ stage: DealStage.PROPOSAL });
        });
    });

    // -------------------------------------------------------------------------
    describe('getDealById', () => {
        it('returns the deal with related customer and lead', async () => {
            const mockDeal = { id: 'd1', title: 'Deal A', customer: {}, lead: {} };
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(mockDeal as any);

            const result = await dealsService.getDealById('d1');

            expect(result).toEqual(mockDeal);
        });

        it('returns null when deal does not exist', async () => {
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(null);

            const result = await dealsService.getDealById('nonexistent');

            expect(result).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('updateDeal', () => {
        it('throws NOT_FOUND when deal does not exist', async () => {
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(null);

            await expect(
                dealsService.updateDeal('nonexistent', { title: 'Updated' })
            ).rejects.toMatchObject({ message: 'Deal not found', code: 'NOT_FOUND' });

            expect(prisma.deal.update).not.toHaveBeenCalled();
        });

        it('updates and returns the deal when it exists', async () => {
            const mockDeal = { id: 'd1', title: 'Updated' };
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(mockDeal as any);
            vi.mocked(prisma.deal.update).mockResolvedValueOnce(mockDeal as any);

            const result = await dealsService.updateDeal('d1', { title: 'Updated' });

            expect(result).toEqual(mockDeal);
            expect(prisma.deal.update).toHaveBeenCalledWith({
                where: { id: 'd1' },
                data: { title: 'Updated' },
            });
        });
    });

    // -------------------------------------------------------------------------
    describe('updateDealStage', () => {
        it('throws NOT_FOUND when deal does not exist', async () => {
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(null);

            await expect(
                dealsService.updateDealStage('nonexistent', DealStage.PROPOSAL)
            ).rejects.toMatchObject({ message: 'Deal not found', code: 'NOT_FOUND' });
        });

        it('sets closedAt when stage transitions to CLOSED_WON', async () => {
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce({ id: 'd1' } as any);
            vi.mocked(prisma.deal.update).mockResolvedValueOnce({} as any);

            await dealsService.updateDealStage('d1', DealStage.CLOSED_WON);

            const updateArg = vi.mocked(prisma.deal.update).mock.calls[0][0];
            expect(updateArg.data.stage).toBe(DealStage.CLOSED_WON);
            expect(updateArg.data.closedAt).toBeInstanceOf(Date);
        });

        it('sets closedAt when stage transitions to CLOSED_LOST', async () => {
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce({ id: 'd1' } as any);
            vi.mocked(prisma.deal.update).mockResolvedValueOnce({} as any);

            await dealsService.updateDealStage('d1', DealStage.CLOSED_LOST);

            const updateArg = vi.mocked(prisma.deal.update).mock.calls[0][0];
            expect(updateArg.data.closedAt).toBeInstanceOf(Date);
        });

        it('sets closedAt to null for non-closed stages', async () => {
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce({ id: 'd1' } as any);
            vi.mocked(prisma.deal.update).mockResolvedValueOnce({} as any);

            await dealsService.updateDealStage('d1', DealStage.NEGOTIATION);

            const updateArg = vi.mocked(prisma.deal.update).mock.calls[0][0];
            expect(updateArg.data.closedAt).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('deleteDeal', () => {
        it('throws NOT_FOUND when deal does not exist', async () => {
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(null);

            await expect(dealsService.deleteDeal('nonexistent')).rejects.toMatchObject({
                message: 'Deal not found',
                code: 'NOT_FOUND',
            });

            expect(prisma.deal.delete).not.toHaveBeenCalled();
        });

        it('deletes and returns the deal when it exists', async () => {
            const mockDeal = { id: 'd1', title: 'Deal A' };
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(mockDeal as any);
            vi.mocked(prisma.deal.delete).mockResolvedValueOnce(mockDeal as any);

            const result = await dealsService.deleteDeal('d1');

            expect(result).toEqual(mockDeal);
            expect(prisma.deal.delete).toHaveBeenCalledWith({ where: { id: 'd1' } });
        });
    });
});
