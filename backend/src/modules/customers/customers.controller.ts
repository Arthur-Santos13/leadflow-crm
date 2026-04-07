import { Request, Response } from 'express';
import * as CustomersService from './customers.service';
import { createCustomerSchema, updateCustomerSchema } from './customers.schema';
import { parsePagination, buildPaginationMeta } from '../../shared/pagination';
import { parseFilters } from '../../shared/filters';
import { successResponse, paginatedResponse, errorResponse } from '../../shared/apiResponse';

export async function create(req: Request, res: Response) {
    const parsed = createCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const customer = await CustomersService.createCustomer(parsed.data);
        res.status(201).json(successResponse(customer));
    } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === 'EMAIL_TAKEN') {
            res.status(409).json(errorResponse(e.message));
            return;
        }
        res.status(500).json(errorResponse('Internal server error'));
    }
}

export async function list(req: Request, res: Response) {
    const pagination = parsePagination(req);
    const filters = parseFilters(req, ['name', 'email', 'company', 'createdAt']);
    const { data, total } = await CustomersService.listCustomers(
        pagination,
        filters.search,
        filters.sort as { field: string; order: 'asc' | 'desc' }
    );
    res.json(paginatedResponse(data, buildPaginationMeta(total, pagination)));
}

export async function getOne(req: Request, res: Response) {
    const customer = await CustomersService.getCustomerById(req.params.id);
    if (!customer) {
        res.status(404).json(errorResponse('Customer not found'));
        return;
    }
    res.json(successResponse(customer));
}

export async function update(req: Request, res: Response) {
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json(errorResponse('Validation error', parsed.error.flatten().fieldErrors));
        return;
    }
    try {
        const customer = await CustomersService.updateCustomer(req.params.id, parsed.data);
        res.json(successResponse(customer));
    } catch (err: unknown) {
        const e = err as NodeJS.ErrnoException;
        if (e.code === 'EMAIL_TAKEN') {
            res.status(409).json(errorResponse(e.message));
            return;
        }
        res.status(404).json(errorResponse('Customer not found'));
    }
}
