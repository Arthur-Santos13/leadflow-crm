import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Rota protegida de exemplo — retorna o usuário autenticado
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;
