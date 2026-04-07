import { InteractionType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { CreateInteractionInput } from './interactions.schema';
import { PaginationParams } from '../../shared/pagination';

export async function createInteraction(data: CreateInteractionInput) {
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

    if (data.dealId) {
        const deal = await prisma.deal.findUnique({ where: { id: data.dealId } });
        if (!deal) {
            const err = new Error('Deal not found');
            (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
            throw err;
        }
    }

    return prisma.interaction.create({ data });
}

export async function listInteractions(
    pagination: PaginationParams,
    filters: { customerId?: string; leadId?: string; dealId?: string; type?: InteractionType },
    sort = { field: 'createdAt', order: 'desc' as const }
) {
    const where = {
        ...(filters.customerId && { customerId: filters.customerId }),
        ...(filters.leadId && { leadId: filters.leadId }),
        ...(filters.dealId && { dealId: filters.dealId }),
        ...(filters.type && { type: filters.type }),
    };
    const allowedSortFields = ['createdAt', 'type'];
    const sortField = allowedSortFields.includes(sort.field) ? sort.field : 'createdAt';
    const [data, total] = await Promise.all([
        prisma.interaction.findMany({
            where,
            skip: pagination.skip,
            take: pagination.take,
            orderBy: { [sortField]: sort.order },
            include: {
                customer: { select: { id: true, name: true } },
                lead: { select: { id: true, title: true } },
                deal: { select: { id: true, title: true, stage: true } },
            },
        }),
        prisma.interaction.count({ where }),
    ]);
    return { data, total };
}

export async function getInteractionById(id: string) {
    return prisma.interaction.findUnique({
        where: { id },
        include: {
            customer: { select: { id: true, name: true } },
            lead: { select: { id: true, title: true } },
            deal: { select: { id: true, title: true, stage: true } },
        },
    });
}

export async function deleteInteraction(id: string) {
    const interaction = await prisma.interaction.findUnique({ where: { id } });
    if (!interaction) {
        const err = new Error('Interaction not found');
        (err as NodeJS.ErrnoException).code = 'NOT_FOUND';
        throw err;
    }
    return prisma.interaction.delete({ where: { id } });
}
