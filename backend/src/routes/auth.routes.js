import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/auth/register - Registro de usuarios (público)
router.post('/register', register);
// POST /api/auth/login - Inicio de sesión (público)
router.post('/login', login);
// GET /api/auth/me - Perfil del usuario autenticado (requiere token)
router.get('/me', authenticate, getMe);

export default router;
