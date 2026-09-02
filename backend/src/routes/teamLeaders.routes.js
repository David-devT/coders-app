import { Router } from 'express';
import { getAll, getById, create, update, remove, promote, demote } from '../controllers/teamLeaders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('teamLeader', 'admin'), getAll);
router.get('/:id', authorize('admin'), getById);
router.post('/', authorize('admin'), create);
router.post('/promote', authorize('admin'), promote);
router.post('/demote', authorize('admin'), demote);
router.put('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);

export default router;
