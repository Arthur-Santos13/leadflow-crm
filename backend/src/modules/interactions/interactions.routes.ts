import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import * as InteractionsController from './interactions.controller';

const router = Router();

router.use(authenticate);

router.post('/', InteractionsController.create);
router.get('/', InteractionsController.list);
router.get('/:id', InteractionsController.getOne);
router.delete('/:id', authorize('ADMIN'), InteractionsController.remove);

export default router;
