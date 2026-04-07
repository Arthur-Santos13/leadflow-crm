import { Request, Response } from 'express';

export abstract class BaseController {
    protected ok<T>(res: Response, data: T) {
        res.status(200).json({ success: true, data });
    }

    protected created<T>(res: Response, data: T) {
        res.status(201).json({ success: true, data });
    }

    protected noContent(res: Response) {
        res.status(204).send();
    }

    protected badRequest(res: Response, message: string, errors?: unknown) {
        res.status(400).json({ success: false, message, ...(errors && { errors }) });
    }

    protected unauthorized(res: Response, message = 'Unauthorized') {
        res.status(401).json({ success: false, message });
    }

    protected forbidden(res: Response, message = 'Forbidden') {
        res.status(403).json({ success: false, message });
    }

    protected notFound(res: Response, message = 'Resource not found') {
        res.status(404).json({ success: false, message });
    }

    protected conflict(res: Response, message: string) {
        res.status(409).json({ success: false, message });
    }

    protected abstract handle(req: Request, res: Response): Promise<void>;
}
