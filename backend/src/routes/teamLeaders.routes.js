import { Router } from 'express';
import { getAll, getById, create, update, remove, promote, demote } from '../controllers/teamLeaders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Exige autenticación con token JWT para acceder a líderes de equipo
router.use(authenticate);

// Lista todos los líderes de equipo (acceso para Team Leaders y Administradores)
router.get('/', authorize('teamLeader', 'admin'), getAll);

// Obtiene información de un líder específico (exclusivo para Administradores)
router.get('/:id', authorize('admin'), getById);

// Registra un nuevo líder de equipo de forma directa (exclusivo para Admin)
router.post('/', authorize('admin'), create);

// Promueve a un Coder existente al rol de Team Leader (exclusivo para Admin)
router.post('/promote', authorize('admin'), promote);

// Degrada a un Team Leader al rol de Coder regular (exclusivo para Admin)
router.post('/demote', authorize('admin'), demote);

// Modifica la información o contraseña de un líder (exclusivo para Admin)
router.put('/:id', authorize('admin'), update);

// Elimina un líder de equipo del sistema (exclusivo para Admin)
router.delete('/:id', authorize('admin'), remove);

export default router;
