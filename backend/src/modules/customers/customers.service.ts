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
    return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(id: string) {
    await prisma.customer.delete({ where: { id } });
}
