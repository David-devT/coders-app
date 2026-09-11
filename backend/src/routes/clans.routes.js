import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/clans.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Exige autenticación con token JWT para acceder a los clanes
router.use(authenticate);

// Lista todos los clanes con sus líderes y miembros asociados
router.get('/', getAll);

// Obtiene los datos específicos de un clan por su identificador
router.get('/:id', getById);

// Crea un nuevo clan (restringido a Team Leaders y Administradores)
router.post('/', authorize('teamLeader', 'admin'), create);

// Modifica el nombre, descripción o líder de un clan (restringido a TL y Admin)
router.put('/:id', authorize('teamLeader', 'admin'), update);

// Elimina un clan del sistema (restringido a TL y Admin)
router.delete('/:id', authorize('teamLeader', 'admin'), remove);

export default router;
