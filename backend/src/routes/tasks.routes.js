import { Router } from 'express';
import { getAll, getById, create, updateStatus, update, remove, getDeleted, restore } from '../controllers/tasks.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', getAll);          // GET - Lectura para cualquier usuario autenticado (filtrado por rol en service)
router.get('/deleted', authorize('admin'), getDeleted);  // GET - Tareas eliminadas (solo admin)
router.get('/:id', getById);
router.post('/', authorize('teamLeader', 'admin'), create);                    // Escritura restringida a teamLeader/admin
router.patch('/:id/status', updateStatus);                                     // Cambio de estado con validación en service
router.put('/:id', authorize('teamLeader', 'admin'), update);                 // Actualización restringida a teamLeader/admin
router.post('/:id/restore', authorize('admin'), restore);                     // Restaurar tarea eliminada (solo admin)
router.delete('/:id', authorize('admin'), remove);                            // Eliminación solo admin (soft delete)

export default router;
