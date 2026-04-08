import { Request, Response } from 'express';
import { DealStage } from '@prisma/client';
import * as DealsService from './deals.service';
import { createDealSchema, updateDealSchema, updateDealStageSchema } from './deals.schema';
import { parsePagination, buildPaginationMeta } from '../../shared/pagination';
import { parseFilters } from '../../shared/filters';
import { successResponse, paginatedResponse, errorResponse } from '../../shared/apiResponse';

export async function create(req: Request, res: Response) {
    const parsed = createDealSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const deal = await DealsService.createDeal(parsed.data);
        res.status(201).json(successResponse(deal));
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
    const filters = parseFilters(req, ['title', 'value', 'createdAt', 'updatedAt', 'expectedAt']);
    const stageParam = req.query.stage as string | undefined;
    const validStages = Object.values(DealStage);
    const stage = stageParam && validStages.includes(stageParam as DealStage)
        ? (stageParam as DealStage)
        : undefined;
    const customerIdParam = req.query.customerId as string | undefined;
    const leadIdParam = req.query.leadId as string | undefined;

    const { data, total } = await DealsService.listDeals(
        pagination,
        { search: filters.search, stage, customerId: customerIdParam, leadId: leadIdParam },
        filters.sort as { field: string; order: 'asc' | 'desc' }
    );
    res.json(paginatedResponse(data, buildPaginationMeta(total, pagination)));
}

export async function getOne(req: Request, res: Response) {
    const deal = await DealsService.getDealById(req.params.id);
    if (!deal) {
        res.status(404).json(errorResponse('Deal not found'));
        return;
    }
    res.json(successResponse(deal));
}

export async function update(req: Request, res: Response) {
    const parsed = updateDealSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const deal = await DealsService.updateDeal(req.params.id, parsed.data);
        res.json(successResponse(deal));
    } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === 'NOT_FOUND') {
            res.status(404).json(errorResponse('Deal not found'));
            return;
        }
        res.status(500).json(errorResponse('Internal server error'));
    }
}

export async function updateStage(req: Request, res: Response) {
    const parsed = updateDealStageSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const deal = await DealsService.updateDealStage(req.params.id, parsed.data.stage);
        res.json(successResponse(deal));
    } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === 'NOT_FOUND') {
            res.status(404).json(errorResponse('Deal not found'));
            return;
        }
        res.status(500).json(errorResponse('Internal server error'));
    }
}

export async function remove(req: Request, res: Response) {
    try {
        await DealsService.deleteDeal(req.params.id);
        res.status(204).send();
    } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === 'NOT_FOUND') {
            res.status(404).json(errorResponse('Deal not found'));
            return;
        }
        res.status(500).json(errorResponse('Internal server error'));
    }
}
