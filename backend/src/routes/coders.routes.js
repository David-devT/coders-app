import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/coders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authorize('teamLeader', 'admin'), create);
router.put('/:id', authorize('teamLeader', 'admin'), update);
router.delete('/:id', authorize('teamLeader', 'admin'), remove);

export default router;
