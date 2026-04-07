import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as InteractionsController from './interactions.controller';

const router = Router();

router.use(authenticate);

router.post('/', InteractionsController.create);
router.get('/', InteractionsController.list);
router.get('/:id', InteractionsController.getOne);
router.delete('/:id', InteractionsController.remove);

export default router;
