import { prisma } from '../../lib/prisma';
import { CreateCustomerInput, UpdateCustomerInput } from './customers.schema';
import { PaginationParams } from '../../shared/pagination';
import { buildSearchWhere } from '../../shared/filters';

export async function createCustomer(data: CreateCustomerInput) {
    const exists = await prisma.customer.findUnique({ where: { email: data.email } });
    if (exists) {
        const err = new Error('Email already in use');
        (err as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
        throw err;
    }
    return prisma.customer.create({ data });
}

export async function listCustomers(
    pagination: PaginationParams,
    search?: string,
    sort = { field: 'createdAt', order: 'desc' as const }
) {
    const where = buildSearchWhere(search, ['name', 'email', 'company']);
    const [data, total] = await Promise.all([
        prisma.customer.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: { [sort.field]: sort.order },
        }),
        prisma.customer.count({ where }),
    ]);
    return { data, total };
}

export async function getCustomerById(id: string) {
    return prisma.customer.findUnique({ where: { id } });
}

export async function updateCustomer(id: string, data: UpdateCustomerInput) {
    if (data.email) {
        const conflict = await prisma.customer.findFirst({
            where: { email: data.email, NOT: { id } },
        });
        if (conflict) {
            const err = new Error('Email already in use');
            (err as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
            throw err;
        }
    }
}

export async function deleteCustomer(id: string) {
    const [leadsCount, dealsCount] = await Promise.all([
        prisma.lead.count({ where: { customerId: id } }),
        prisma.deal.count({ where: { customerId: id } }),
    ]);
    if (leadsCount > 0 || dealsCount > 0) {
        const err = new Error(
            `Cannot delete customer with ${leadsCount} lead(s) and ${dealsCount} deal(s)`
        );
        (err as NodeJS.ErrnoException).code = 'HAS_RELATIONS';
        throw err;
    }
}
