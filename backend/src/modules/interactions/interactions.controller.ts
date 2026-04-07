import { Request, Response } from 'express';
import { InteractionType } from '@prisma/client';
import * as InteractionsService from './interactions.service';
import { createInteractionSchema } from './interactions.schema';
import { parsePagination, buildPaginationMeta } from '../../shared/pagination';
import { parseFilters } from '../../shared/filters';
import { successResponse, paginatedResponse, errorResponse } from '../../shared/apiResponse';

export async function create(req: Request, res: Response) {
    const parsed = createInteractionSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const interaction = await InteractionsService.createInteraction(parsed.data);
        res.status(201).json(successResponse(interaction));
    } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === 'NOT_FOUND') {
            res.status(404).json(errorResponse(e.message));
            return;
        }
        res.status(500).json(errorResponse('Internal server error'));
    }
}

export async function list(req: Request, res: Response) {
    const pagination = parsePagination(req);
    const filters = parseFilters(req, ['createdAt', 'type']);
    const typeParam = req.query.type as string | undefined;
    const validTypes = Object.values(InteractionType);
    const type = typeParam && validTypes.includes(typeParam as InteractionType)
        ? (typeParam as InteractionType)
        : undefined;
    const customerIdParam = req.query.customerId as string | undefined;
    const leadIdParam = req.query.leadId as string | undefined;
    const dealIdParam = req.query.dealId as string | undefined;

    const { data, total } = await InteractionsService.listInteractions(
        pagination,
        { customerId: customerIdParam, leadId: leadIdParam, dealId: dealIdParam, type },
        filters.sort as { field: string; order: 'asc' | 'desc' }
    );
    res.json(paginatedResponse(data, buildPaginationMeta(total, pagination)));
}

export async function getOne(req: Request, res: Response) {
    const interaction = await InteractionsService.getInteractionById(req.params.id);
    if (!interaction) {
        res.status(404).json(errorResponse('Interaction not found'));
        return;
    }
    res.json(successResponse(interaction));
}

export async function remove(req: Request, res: Response) {
    try {
        await InteractionsService.deleteInteraction(req.params.id);
        res.status(204).send();
    } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === 'NOT_FOUND') {
            res.status(404).json(errorResponse('Interaction not found'));
            return;
        }
        res.status(500).json(errorResponse('Internal server error'));
    }
}
