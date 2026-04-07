export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: PaginationMeta;
}

export interface PaginationMeta {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export function successResponse<T>(data: T): ApiResponse<T> {
    return { success: true, data };
}

export function paginatedResponse<T>(
    data: T[],
    meta: PaginationMeta
): PaginatedResponse<T> {
    return { success: true, data, meta };
}

export function errorResponse(
    message: string,
    errors?: Record<string, string[]>
): ApiResponse<never> {
    return { success: false, message, ...(errors && { errors }) };
}
