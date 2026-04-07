import { LeadStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CreateLeadInput, UpdateLeadInput } from './leads.schema';
import { PaginationParams } from '../../shared/pagination';
import { buildSearchWhere } from '../../shared/filters';

export async function createLead(data: CreateLeadInput) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
        const err = new Error('Customer not found');
        (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
        throw err;
    }
    return prisma.lead.create({ data });
}

export async function listLeads(
    pagination: PaginationParams,
    filters: { search?: string; status?: LeadStatus; customerId?: string; source?: string },
    sort = { field: 'createdAt', order: 'desc' as const }
) {
    const searchWhere = buildSearchWhere(filters.search, ['title', 'source', 'notes']);
    const where = {
        ...searchWhere,
        ...(filters.status && { status: filters.status }),
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.source && { source: { contains: filters.source, mode: 'insensitive' as const } }),
    };
    const [data, total] = await Promise.all([
        prisma.lead.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: { [sort.field]: sort.order },
            include: { customer: { select: { id: true, name: true, email: true } } },
        }),
        prisma.lead.count({ where }),
    ]);
    return { data, total };
}

export async function getLeadById(id: string) {
    return prisma.lead.findUnique({
        where: { id },
        include: { customer: { select: { id: true, name: true, email: true } } },
    });
}

export async function updateLead(id: string, data: UpdateLeadInput) {
    return prisma.lead.update({ where: { id }, data });
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
    return prisma.lead.update({ where: { id }, data: { status } });
}

export async function deleteLead(id: string) {
    await prisma.lead.delete({ where: { id } });
}
