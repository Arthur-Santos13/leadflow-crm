import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    code?: string;
    statusCode?: number;
}

const ERROR_CODE_MAP: Record<string, number> = {
    NOT_FOUND: 404,
    EMAIL_TAKEN: 409,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
};

export function errorHandler(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    const statusCode = err.statusCode ?? (err.code ? (ERROR_CODE_MAP[err.code] ?? 400) : 500);
    const message = statusCode === 500 ? 'Internal server error' : err.message;

    if (statusCode === 500) {
        console.error('[ERROR]', err);
    }

    res.status(statusCode).json({ success: false, message });
}
