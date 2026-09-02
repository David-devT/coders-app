import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  updateStatus,
  update,
  remove,
  getDeleted,
  restore,
} from '../controllers/tasks.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/deleted', authorize('admin'), getDeleted);
router.get('/:id', getById);
router.post('/', authorize('teamLeader', 'admin'), create);
router.patch('/:id/status', updateStatus);
router.put('/:id', authorize('teamLeader', 'admin'), update);
router.post('/:id/restore', authorize('admin'), restore);
router.delete('/:id', authorize('admin'), remove);

export default router;
