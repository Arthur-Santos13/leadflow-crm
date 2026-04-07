import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import * as DealsController from './deals.controller';

const router = Router();

router.use(authenticate);

router.post('/', DealsController.create);
router.get('/', DealsController.list);
router.get('/:id', DealsController.getOne);
router.patch('/:id', DealsController.update);
router.patch('/:id/stage', DealsController.updateStage);
router.delete('/:id', authorize('ADMIN'), DealsController.remove);

export default router;
