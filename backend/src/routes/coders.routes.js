import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/coders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Protege todas las rutas del módulo requiriendo autenticación previa
router.use(authenticate);

// Obtiene la lista de todos los programadores registrados
router.get('/', getAll);

// Obtiene la información detallada de un programador por su ID
router.get('/:id', getById);

// Crea un nuevo programador (restringido a Team Leaders y Administradores)
router.post('/', authorize('teamLeader', 'admin'), create);

// Actualiza los datos de un programador existente (restringido a TL y Admin)
router.put('/:id', authorize('teamLeader', 'admin'), update);

// Elimina un programador del sistema (restringido a TL y Admin)
router.delete('/:id', authorize('teamLeader', 'admin'), remove);

export default router;
