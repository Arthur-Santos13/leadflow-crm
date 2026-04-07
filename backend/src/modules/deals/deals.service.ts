import { DealStage } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CreateDealInput, UpdateDealInput } from './deals.schema';
import { PaginationParams } from '../../shared/pagination';
import { buildSearchWhere } from '../../shared/filters';

export async function createDeal(data: CreateDealInput) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
        const err = new Error('Customer not found');
        (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
        throw err;
    }

    if (data.leadId) {
        const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
        if (!lead) {
            const err = new Error('Lead not found');
            (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
            throw err;
        }
    }

    return prisma.deal.create({ data });
}

export async function listDeals(
    pagination: PaginationParams,
    filters: { search?: string; stage?: DealStage; customerId?: string; leadId?: string },
    sort = { field: 'createdAt', order: 'desc' as const }
) {
    const searchWhere = buildSearchWhere(filters.search, ['title']);
    const where = {
        ...searchWhere,
        ...(filters.stage && { stage: filters.stage }),
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.leadId && { leadId: filters.leadId }),
    };
    const allowedSortFields = ['createdAt', 'title', 'value', 'expectedAt'];
    const sortField = allowedSortFields.includes(sort.field) ? sort.field : 'createdAt';
    const [data, total] = await Promise.all([
        prisma.deal.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: { [sortField]: sort.order },
            include: {
                customer: { select: { id: true, name: true, email: true } },
                lead: { select: { id: true, title: true, status: true } },
            },
        }),
        prisma.deal.count({ where }),
    ]);
    return { data, total };
}

export async function getDealById(id: string) {
    return prisma.deal.findUnique({
        where: { id },
        include: {
            customer: { select: { id: true, name: true, email: true } },
            lead: { select: { id: true, title: true, status: true } },
        },
    });
}

export async function updateDeal(id: string, data: UpdateDealInput) {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) {
        const err = new Error('Deal not found');
        (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
        throw err;
    }
    return prisma.deal.update({ where: { id }, data });
}

export async function updateDealStage(id: string, stage: DealStage) {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) {
        const err = new Error('Deal not found');
        (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
        throw err;
    }
    const closedStages = [DealStage.CLOSED_WON, DealStage.CLOSED_LOST];
    const closedAt = closedStages.includes(stage) ? new Date() : null;
    return prisma.deal.update({ where: { id }, data: { stage, closedAt } });
}

export async function deleteDeal(id: string) {
    const deal = await prisma.deal.findUnique({ where: { id } });
    if (!deal) {
        const err = new Error('Deal not found');
        (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
        throw err;
    }
    return prisma.deal.delete({ where: { id } });
}
