import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validation.middleware.js';

const router = Router();

// Registro de nuevos programadores (Coder) con limitador y validación
router.post('/register', authRateLimiter, validateRegister, register);

// Inicio de sesión y generación de token JWT con limitador y validación
router.post('/login', authRateLimiter, validateLogin, login);

// Obtención del perfil y rol del usuario autenticado
router.get('/me', authenticate, getMe);

export default router;
