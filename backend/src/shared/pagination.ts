import { Request } from 'express';
import { PaginationMeta } from './apiResponse';

export interface PaginationParams {
    page: number;
    perPage: number;
    skip: number;
    take: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 100;

export function parsePagination(req: Request): PaginationParams {
    const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const perPage = Math.min(
        MAX_PER_PAGE,
        Math.max(1, parseInt(req.query.perPage as string) || DEFAULT_PER_PAGE)
    );

    return {
        page,
        perPage,
        skip: (page - 1) * perPage,
        take: perPage,
    };
}

export function buildPaginationMeta(
    total: number,
    { page, perPage }: PaginationParams
): PaginationMeta {
    const totalPages = Math.ceil(total / perPage);
    return {
        total,
        page,
        perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
