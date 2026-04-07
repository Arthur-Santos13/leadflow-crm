import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as DealsController from './deals.controller';

const router = Router();

router.use(authenticate);

router.post('/', DealsController.create);
router.get('/', DealsController.list);
router.get('/:id', DealsController.getOne);
router.patch('/:id', DealsController.update);
router.patch('/:id/stage', DealsController.updateStage);
router.delete('/:id', DealsController.remove);

export default router;
