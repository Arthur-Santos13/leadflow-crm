import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as CustomersController from './customers.controller';

const router = Router();

router.use(authenticate);

router.post('/', CustomersController.create);
router.get('/', CustomersController.list);
router.get('/:id', CustomersController.getOne);
router.patch('/:id', CustomersController.update);
router.delete('/:id', CustomersController.remove);

export default router;
