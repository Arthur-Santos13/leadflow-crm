import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LeadStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import * as leadsService from '../modules/leads/leads.service';

describe('leads.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('createLead', () => {
        it('throws NOT_FOUND when customer does not exist', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(null);

            await expect(
                leadsService.createLead({
                    title: 'New Lead',
                    customerId: 'c-uuid',
                    status: LeadStatus.NEW,
                })
            ).rejects.toMatchObject({ message: 'Customer not found', code: 'NOT_FOUND' });

            expect(prisma.lead.create).not.toHaveBeenCalled();
        });

        it('creates and returns the lead when customer exists', async () => {
            const mockCustomer = { id: 'c-uuid', name: 'ACME' };
            const mockLead = { id: 'l1', title: 'New Lead', customerId: 'c-uuid' };
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(mockCustomer as any);
            vi.mocked(prisma.lead.create).mockResolvedValueOnce(mockLead as any);

            const result = await leadsService.createLead({
                title: 'New Lead',
                customerId: 'c-uuid',
                status: LeadStatus.NEW,
            });

            expect(result).toEqual(mockLead);
            expect(prisma.lead.create).toHaveBeenCalledOnce();
        });
    });

    // -------------------------------------------------------------------------
    describe('listLeads', () => {
        it('returns paginated data and total count', async () => {
            const mockData = [{ id: 'l1', title: 'Lead A' }];
            vi.mocked(prisma.lead.findMany).mockResolvedValueOnce(mockData as any);
            vi.mocked(prisma.lead.count).mockResolvedValueOnce(1);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            const result = await leadsService.listLeads(pagination, {});

            expect(result.data).toEqual(mockData);
            expect(result.total).toBe(1);
        });

        it('applies status filter to the query', async () => {
            vi.mocked(prisma.lead.findMany).mockResolvedValueOnce([] as any);
            vi.mocked(prisma.lead.count).mockResolvedValueOnce(0);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            await leadsService.listLeads(pagination, { status: LeadStatus.QUALIFIED });

            const findManyCall = vi.mocked(prisma.lead.findMany).mock.calls[0][0];
            expect(findManyCall?.where).toMatchObject({ status: LeadStatus.QUALIFIED });
        });

        it('applies customerId filter to the query', async () => {
            vi.mocked(prisma.lead.findMany).mockResolvedValueOnce([] as any);
            vi.mocked(prisma.lead.count).mockResolvedValueOnce(0);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            await leadsService.listLeads(pagination, { customerId: 'c-uuid' });

            const findManyCall = vi.mocked(prisma.lead.findMany).mock.calls[0][0];
            expect(findManyCall?.where).toMatchObject({ customerId: 'c-uuid' });
        });
    });

    // -------------------------------------------------------------------------
    describe('getLeadById', () => {
        it('returns the lead with customer relation included', async () => {
            const mockLead = {
                id: 'l1',
                title: 'Lead A',
                customer: { id: 'c1', name: 'ACME', email: 'acme@b.com' },
            };
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce(mockLead as any);

            const result = await leadsService.getLeadById('l1');

            expect(result).toEqual(mockLead);
            expect(prisma.lead.findUnique).toHaveBeenCalledWith({
                where: { id: 'l1' },
                include: { customer: { select: { id: true, name: true, email: true } } },
            });
        });

        it('returns null when lead does not exist', async () => {
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce(null);

            const result = await leadsService.getLeadById('nonexistent');

            expect(result).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('updateLead', () => {
        it('calls prisma update with the correct args', async () => {
            const mockLead = { id: 'l1', title: 'Updated' };
            vi.mocked(prisma.lead.update).mockResolvedValueOnce(mockLead as any);

            const result = await leadsService.updateLead('l1', { title: 'Updated' });

            expect(result).toEqual(mockLead);
            expect(prisma.lead.update).toHaveBeenCalledWith({
                where: { id: 'l1' },
                data: { title: 'Updated' },
            });
        });
    });

    // -------------------------------------------------------------------------
    describe('updateLeadStatus', () => {
        it('throws NOT_FOUND when lead does not exist', async () => {
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce(null);

            await expect(
                leadsService.updateLeadStatus('nonexistent', LeadStatus.QUALIFIED)
            ).rejects.toMatchObject({ message: 'Lead not found', code: 'NOT_FOUND' });
        });

        it('resolves when lead exists', async () => {
            vi.mocked(prisma.lead.findUnique).mockResolvedValueOnce({
                id: 'l1',
                status: LeadStatus.NEW,
            } as any);
            const updated = {
                id: 'l1',
                status: LeadStatus.QUALIFIED,
                customer: { id: 'c1', name: 'ACME', email: 'a@b.com' },
            };
            vi.mocked(prisma.lead.update).mockResolvedValueOnce(updated as any);

            const result = await leadsService.updateLeadStatus('l1', LeadStatus.QUALIFIED);

            expect(result).toEqual(updated);
            expect(prisma.lead.update).toHaveBeenCalledWith({
                where: { id: 'l1' },
                data: { status: LeadStatus.QUALIFIED },
                include: { customer: { select: { id: true, name: true, email: true } } },
            });
        });
    });

    // -------------------------------------------------------------------------
    describe('deleteLead', () => {
        it('throws HAS_RELATIONS when the lead has attached deals', async () => {
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(2);

            await expect(
                leadsService.deleteLead('l1')
            ).rejects.toMatchObject({ code: 'HAS_RELATIONS' });
        });

        it('deletes the lead when it has no deals', async () => {
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(0);
            vi.mocked(prisma.lead.delete).mockResolvedValueOnce({ id: 'l1' } as any);

            const result = await leadsService.deleteLead('l1');

            expect(result).toEqual({ id: 'l1' });
            expect(prisma.lead.delete).toHaveBeenCalledWith({ where: { id: 'l1' } });
        });
    });
});
