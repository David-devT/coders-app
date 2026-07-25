import { Router } from 'express';
import { getAll, getById, create, update, remove, promote, demote } from '../controllers/teamLeaders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación + rol admin exclusivamente
router.use(authenticate);

router.get('/', authorize('admin'), getAll);        // CRUD completo restringido a admin
router.get('/:id', authorize('admin'), getById);
router.post('/', authorize('admin'), create);
router.post('/promote', authorize('admin'), promote);   // Promover coder a team leader
router.post('/demote', authorize('admin'), demote);     // Degradar team leader a coder
router.put('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);

export default router;
