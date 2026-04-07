import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { prisma } from '../../lib/prisma';
import * as UsersController from './users.controller';

const router = Router();

router.get('/me', authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ user });
});

router.get('/', authenticate, authorize('ADMIN'), UsersController.getUsers);
router.patch('/:id/role', authenticate, authorize('ADMIN'), UsersController.updateRole);

export default router;
