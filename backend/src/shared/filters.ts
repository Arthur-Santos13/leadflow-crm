import { Request } from 'express';

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
    field: string;
    order: SortOrder;
}

export interface FilterParams {
    search?: string;
    sort: SortParams;
    [key: string]: unknown;
}

/**
 * Parses common filter query params from the request.
 * @param req - Express request
 * @param allowedSortFields - whitelist of sortable field names
 * @param defaultSortField - fallback sort field
 */
export function parseFilters(
    req: Request,
    allowedSortFields: string[],
    defaultSortField = 'createdAt'
): FilterParams {
    const search = (req.query.search as string) || undefined;

    const sortField = allowedSortFields.includes(req.query.sortBy as string)
        ? (req.query.sortBy as string)
        : defaultSortField;

    const sortOrder: SortOrder =
        req.query.order === 'asc' || req.query.order === 'desc'
            ? req.query.order
            : 'desc';

    return {
        search,
        sort: { field: sortField, order: sortOrder },
    };
}

/**
 * Builds a Prisma-compatible `where` clause for string search across multiple fields.
 */
export function buildSearchWhere(search: string | undefined, fields: string[]) {
    if (!search) return {};
    return {
        OR: fields.map((field) => ({
            [field]: { contains: search, mode: 'insensitive' as const },
        })),
    };
}
