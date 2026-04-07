import { vi, describe, it, expect, beforeEach } from 'vitest';
import { InteractionType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import * as interactionsService from '../modules/interactions/interactions.service';

describe('interactions.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('createInteraction', () => {
        it('throws NOT_FOUND when customer does not exist', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(null);

            await expect(
                interactionsService.createInteraction({
                    type: InteractionType.EMAIL,
                    content: 'Hello',
                    customerId: 'c-uuid',
                })
            ).rejects.toMatchObject({ message: 'Customer not found', code: 'NOT_FOUND' });

            expect(prisma.interaction.create).not.toHaveBeenCalled();
        });

        it('throws NOT_FOUND when leadId is provided but lead does not exist', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c-uuid',
            } as any);
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce(null);

            await expect(
                interactionsService.createInteraction({
                    type: InteractionType.CALL,
                    content: 'Discussed requirements',
                    customerId: 'c-uuid',
                    leadId: 'l-uuid',
                })
            ).rejects.toMatchObject({ message: 'Lead not found', code: 'NOT_FOUND' });

            expect(prisma.interaction.create).not.toHaveBeenCalled();
        });

        it('throws NOT_FOUND when dealId is provided but deal does not exist', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c-uuid',
            } as any);
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce(null);

            await expect(
                interactionsService.createInteraction({
                    type: InteractionType.MEETING,
                    content: 'Demo session',
                    customerId: 'c-uuid',
                    dealId: 'd-uuid',
                })
            ).rejects.toMatchObject({ message: 'Deal not found', code: 'NOT_FOUND' });

            expect(prisma.interaction.create).not.toHaveBeenCalled();
        });

        it('creates interaction successfully with only required fields', async () => {
            const mockInteraction = {
                id: 'i1',
                type: InteractionType.EMAIL,
                content: 'Hello',
                customerId: 'c-uuid',
            };
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c-uuid',
            } as any);
            vi.mocked(prisma.interaction.create).mockResolvedValueOnce(mockInteraction as any);

            const result = await interactionsService.createInteraction({
                type: InteractionType.EMAIL,
                content: 'Hello',
                customerId: 'c-uuid',
            });

            expect(result).toEqual(mockInteraction);
            expect(prisma.lead.findUnique).not.toHaveBeenCalled();
            expect(prisma.deal.findUnique).not.toHaveBeenCalled();
        });

        it('creates interaction successfully with leadId and dealId', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c-uuid',
            } as any);
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce({ id: 'l-uuid' } as any);
            vi.mocked(prisma.deal.findUnique).mockResolvedValueOnce({ id: 'd-uuid' } as any);
            vi.mocked(prisma.interaction.create).mockResolvedValueOnce({ id: 'i1' } as any);

            const result = await interactionsService.createInteraction({
                type: InteractionType.NOTE,
                content: 'Follow up needed',
                customerId: 'c-uuid',
                leadId: 'l-uuid',
                dealId: 'd-uuid',
            });

            expect(result).toEqual({ id: 'i1' });
            expect(prisma.interaction.create).toHaveBeenCalledOnce();
        });
    });

    // -------------------------------------------------------------------------
    describe('listInteractions', () => {
        it('returns paginated data and total count', async () => {
            const mockData = [{ id: 'i1', type: InteractionType.EMAIL }];
            vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce(mockData as any);
            vi.mocked(prisma.interaction.count).mockResolvedValueOnce(1);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            const result = await interactionsService.listInteractions(pagination, {});

            expect(result.data).toEqual(mockData);
            expect(result.total).toBe(1);
        });

        it('applies type filter to the query', async () => {
            vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce([] as any);
            vi.mocked(prisma.interaction.count).mockResolvedValueOnce(0);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            await interactionsService.listInteractions(pagination, {
                type: InteractionType.CALL,
            });

            const findManyCall = vi.mocked(prisma.interaction.findMany).mock.calls[0][0];
            expect(findManyCall?.where).toMatchObject({ type: InteractionType.CALL });
        });

        it('applies customerId filter to the query', async () => {
            vi.mocked(prisma.interaction.findMany).mockResolvedValueOnce([] as any);
            vi.mocked(prisma.interaction.count).mockResolvedValueOnce(0);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            await interactionsService.listInteractions(pagination, { customerId: 'c-uuid' });

            const findManyCall = vi.mocked(prisma.interaction.findMany).mock.calls[0][0];
            expect(findManyCall?.where).toMatchObject({ customerId: 'c-uuid' });
        });
    });

    // -------------------------------------------------------------------------
    describe('getInteractionById', () => {
        it('returns the interaction with related entities', async () => {
            const mockInteraction = {
                id: 'i1',
                type: InteractionType.EMAIL,
                customer: { id: 'c1', name: 'ACME' },
                lead: null,
                deal: null,
            };
            vi.mocked(prisma.interaction.findUnique).mockResolvedValueOnce(
                mockInteraction as any
            );

            const result = await interactionsService.getInteractionById('i1');

            expect(result).toEqual(mockInteraction);
        });

        it('returns null when interaction does not exist', async () => {
            vi.mocked(prisma.interaction.findUnique).mockResolvedValueOnce(null);

            const result = await interactionsService.getInteractionById('nonexistent');

            expect(result).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('deleteInteraction', () => {
        it('throws NOT_FOUND when interaction does not exist', async () => {
            vi.mocked(prisma.interaction.findUnique).mockResolvedValueOnce(null);

            await expect(
                interactionsService.deleteInteraction('nonexistent')
            ).rejects.toMatchObject({ message: 'Interaction not found', code: 'NOT_FOUND' });

            expect(prisma.interaction.delete).not.toHaveBeenCalled();
        });

        it('deletes and returns the interaction when it exists', async () => {
            const mockInteraction = { id: 'i1', type: InteractionType.EMAIL };
            vi.mocked(prisma.interaction.findUnique).mockResolvedValueOnce(
                mockInteraction as any
            );
            vi.mocked(prisma.interaction.delete).mockResolvedValueOnce(mockInteraction as any);

            const result = await interactionsService.deleteInteraction('i1');

            expect(result).toEqual(mockInteraction);
            expect(prisma.interaction.delete).toHaveBeenCalledWith({ where: { id: 'i1' } });
        });
    });
});
