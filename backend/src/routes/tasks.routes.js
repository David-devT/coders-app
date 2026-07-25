import { Router } from 'express';
import { getAll, getById, create, updateStatus, update, remove } from '../controllers/tasks.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', getAll);          // GET - Lectura para cualquier usuario autenticado (filtrado por rol en service)
router.get('/:id', getById);
router.post('/', authorize('teamLeader', 'admin'), create);                    // Escritura restringida a teamLeader/admin
router.patch('/:id/status', updateStatus);                                     // Cambio de estado con validación en service
router.put('/:id', authorize('teamLeader', 'admin'), update);                 // Actualización restringida a teamLeader/admin
router.delete('/:id', authorize('admin'), remove);                            // Eliminación solo admin

export default router;
