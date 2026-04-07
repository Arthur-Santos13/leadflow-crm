import { Request, Response } from 'express';
import { LeadStatus } from '@prisma/client';
import * as LeadsService from './leads.service';
import { createLeadSchema, updateLeadSchema, updateLeadStatusSchema } from './leads.schema';
import { parsePagination, buildPaginationMeta } from '../../shared/pagination';
import { parseFilters } from '../../shared/filters';
import { successResponse, paginatedResponse, errorResponse } from '../../shared/apiResponse';

export async function create(req: Request, res: Response) {
    const parsed = createLeadSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const lead = await LeadsService.createLead(parsed.data);
        res.status(201).json(successResponse(lead));
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
    const filters = parseFilters(req, ['title', 'source', 'createdAt']);
    const statusParam = req.query.status as LeadStatus | undefined;
    const customerIdParam = req.query.customerId as string | undefined;

    const { data, total } = await LeadsService.listLeads(
        pagination,
        { search: filters.search, status: statusParam, customerId: customerIdParam },
        filters.sort as { field: string; order: 'asc' | 'desc' }
    );
    res.json(paginatedResponse(data, buildPaginationMeta(total, pagination)));
}

export async function getOne(req: Request, res: Response) {
    const lead = await LeadsService.getLeadById(req.params.id);
    if (!lead) {
        res.status(404).json(errorResponse('Lead not found'));
        return;
    }
    res.json(successResponse(lead));
}

export async function update(req: Request, res: Response) {
    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const lead = await LeadsService.updateLead(req.params.id, parsed.data);
        res.json(successResponse(lead));
    } catch {
        res.status(404).json(errorResponse('Lead not found'));
    }
}

export async function updateStatus(req: Request, res: Response) {
    const parsed = updateLeadStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const lead = await LeadsService.updateLeadStatus(req.params.id, parsed.data.status);
        res.json(successResponse(lead));
    } catch {
        res.status(404).json(errorResponse('Lead not found'));
    }
}

export async function remove(req: Request, res: Response) {
    try {
        await LeadsService.deleteLead(req.params.id);
        res.status(204).send();
    } catch {
        res.status(404).json(errorResponse('Lead not found'));
    }
}
