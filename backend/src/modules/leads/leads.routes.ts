import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as LeadsController from './leads.controller';

const router = Router();

router.use(authenticate);

router.post('/', LeadsController.create);
router.get('/', LeadsController.list);
router.get('/:id', LeadsController.getOne);
router.patch('/:id', LeadsController.update);
router.patch('/:id/status', LeadsController.updateStatus);
router.delete('/:id', LeadsController.remove);

export default router;
