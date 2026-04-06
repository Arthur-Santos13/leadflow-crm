import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from './auth.schema';

export async function register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const result = await AuthService.register(
            parsed.data.name,
            parsed.data.email,
            parsed.data.password
        );
        res.status(201).json(result);
    } catch (err: unknown) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === 'EMAIL_TAKEN') {
            res.status(409).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const result = await AuthService.login(parsed.data.email, parsed.data.password);
        res.json(result);
    } catch {
        res.status(401).json({ message: 'Invalid credentials' });
    }
}

export async function forgotPassword(req: Request, res: Response) {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
        return;
    }

    const result = await AuthService.forgotPassword(parsed.data.email);
    res.json(result);
}

export async function resetPassword(req: Request, res: Response) {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const result = await AuthService.resetPassword(
            parsed.data.token,
            parsed.data.password
        );
        res.json(result);
    } catch {
        res.status(400).json({ message: 'Token invalid or expired' });
    }
}
