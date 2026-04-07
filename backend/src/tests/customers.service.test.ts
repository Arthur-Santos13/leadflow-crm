import { vi, describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma';
import * as customersService from '../modules/customers/customers.service';

describe('customers.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('createCustomer', () => {
        it('throws EMAIL_TAKEN when email is already in use', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce({
                id: 'c1',
                email: 'a@b.com',
            } as any);

            await expect(
                customersService.createCustomer({ name: 'John', email: 'a@b.com' })
            ).rejects.toMatchObject({ message: 'Email already in use', code: 'EMAIL_TAKEN' });

            expect(prisma.customer.create).not.toHaveBeenCalled();
        });

        it('creates and returns the customer when email is unique', async () => {
            const mockCustomer = { id: 'c1', name: 'John', email: 'a@b.com' };
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(null);
            vi.mocked(prisma.customer.create).mockResolvedValueOnce(mockCustomer as any);

            const result = await customersService.createCustomer({
                name: 'John',
                email: 'a@b.com',
            });

            expect(result).toEqual(mockCustomer);
            expect(prisma.customer.create).toHaveBeenCalledWith({
                data: { name: 'John', email: 'a@b.com' },
            });
        });
    });

    // -------------------------------------------------------------------------
    describe('listCustomers', () => {
        it('returns paginated data and total count', async () => {
            const mockData = [{ id: 'c1', name: 'John' }];
            vi.mocked(prisma.customer.findMany).mockResolvedValueOnce(mockData as any);
            vi.mocked(prisma.customer.count).mockResolvedValueOnce(1);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            const result = await customersService.listCustomers(pagination);

            expect(result.data).toEqual(mockData);
            expect(result.total).toBe(1);
        });

        it('passes search filter to the query', async () => {
            vi.mocked(prisma.customer.findMany).mockResolvedValueOnce([] as any);
            vi.mocked(prisma.customer.count).mockResolvedValueOnce(0);

            const pagination = { page: 1, perPage: 20, skip: 0, take: 20 };
            await customersService.listCustomers(pagination, 'Acme');

            const findManyCall = vi.mocked(prisma.customer.findMany).mock.calls[0][0];
            expect(JSON.stringify(findManyCall?.where)).toContain('Acme');
        });
    });

    // -------------------------------------------------------------------------
    describe('getCustomerById', () => {
        it('returns the customer matching the given id', async () => {
            const mockCustomer = { id: 'c1', name: 'John', email: 'a@b.com' };
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(mockCustomer as any);

            const result = await customersService.getCustomerById('c1');

            expect(result).toEqual(mockCustomer);
            expect(prisma.customer.findUnique).toHaveBeenCalledWith({ where: { id: 'c1' } });
        });

        it('returns null when customer does not exist', async () => {
            vi.mocked(prisma.customer.findUnique).mockResolvedValueOnce(null);

            const result = await customersService.getCustomerById('nonexistent');

            expect(result).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('updateCustomer', () => {
        it('throws EMAIL_TAKEN when new email is used by another customer', async () => {
            vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce({
                id: 'c2',
                email: 'taken@b.com',
            } as any);

            await expect(
                customersService.updateCustomer('c1', { email: 'taken@b.com' })
            ).rejects.toMatchObject({ message: 'Email already in use', code: 'EMAIL_TAKEN' });
        });

        it('does not throw when the updated email belongs to the same customer', async () => {
            vi.mocked(prisma.customer.findFirst).mockResolvedValueOnce(null);

            await expect(
                customersService.updateCustomer('c1', { email: 'same@b.com' })
            ).resolves.not.toThrow();
        });

        it('skips email conflict check when email is not being updated', async () => {
            await customersService.updateCustomer('c1', { name: 'New Name' });

            expect(prisma.customer.findFirst).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    describe('deleteCustomer', () => {
        it('throws HAS_RELATIONS when customer has associated leads or deals', async () => {
            vi.mocked(prisma.lead.count).mockResolvedValueOnce(2);
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(1);

            await expect(
                customersService.deleteCustomer('c1')
            ).rejects.toMatchObject({ code: 'HAS_RELATIONS' });
        });

        it('throws HAS_RELATIONS when customer has only leads', async () => {
            vi.mocked(prisma.lead.count).mockResolvedValueOnce(1);
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(0);

            await expect(
                customersService.deleteCustomer('c1')
            ).rejects.toMatchObject({ code: 'HAS_RELATIONS' });
        });

        it('throws HAS_RELATIONS when customer has only deals', async () => {
            vi.mocked(prisma.lead.count).mockResolvedValueOnce(0);
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(1);

            await expect(
                customersService.deleteCustomer('c1')
            ).rejects.toMatchObject({ code: 'HAS_RELATIONS' });
        });

        it('completes without error when customer has no relations', async () => {
            vi.mocked(prisma.lead.count).mockResolvedValueOnce(0);
            vi.mocked(prisma.deal.count).mockResolvedValueOnce(0);

            await expect(customersService.deleteCustomer('c1')).resolves.toBeUndefined();
        });
    });
});
