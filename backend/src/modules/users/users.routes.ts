import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import * as UsersController from './users.controller';

const router = Router();

router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

router.get('/', authenticate, authorize('ADMIN'), UsersController.getUsers);
router.patch('/:id/role', authenticate, authorize('ADMIN'), UsersController.updateRole);

export default router;
