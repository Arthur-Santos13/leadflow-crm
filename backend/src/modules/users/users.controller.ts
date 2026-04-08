import { Request, Response } from 'express';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import * as UsersService from './users.service';
import { successResponse } from '../../shared/apiResponse';

export async function getUsers(_req: Request, res: Response) {
    const users = await UsersService.listUsers();
    res.json(successResponse(users));
}

const updateRoleSchema = z.object({
    role: z.nativeEnum(UserRole),
});

export async function updateRole(req: Request, res: Response) {
    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
        return;
    }

    try {
        const user = await UsersService.updateUserRole(
            req.params.id,
            parsed.data.role,
            req.user!.id
        );
        res.json(successResponse(user));
    } catch (err: unknown) {
        const error = err as NodeJS.ErrnoException;
        if (error.code === 'SELF_ROLE_CHANGE') {
            res.status(400).json({ success: false, message: error.message });
        } else if (error.code === 'NOT_FOUND') {
            res.status(404).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
