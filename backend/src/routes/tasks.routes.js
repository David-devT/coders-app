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
import { validateCreateTask, validateUpdateTaskStatus } from '../middleware/validation.middleware.js';

const router = Router();

// Exige autenticación con token JWT para cualquier operación sobre tareas
router.use(authenticate);

// Lista las tareas activas (con filtros por clan, asignado o estado)
router.get('/', getAll);

// Consulta la papelera de reciclaje con tareas eliminadas lógicamente (solo Admin)
router.get('/deleted', authorize('admin'), getDeleted);

// Obtiene los detalles de una tarea específica por su ID
router.get('/:id', getById);

// Crea una nueva tarea técnica asignable con validación previa de campos (restringido a TL y Admin)
router.post('/', authorize('teamLeader', 'admin'), validateCreateTask, create);

// Actualiza el estado Kanban de la tarea con validación de flujo, campos y roles
router.patch('/:id/status', validateUpdateTaskStatus, updateStatus);

// Modifica datos generales de la tarea como título, descripción o prioridad (TL y Admin)
router.put('/:id', authorize('teamLeader', 'admin'), update);

// Restaura una tarea eliminada devolviéndola al tablero Kanban (solo Admin)
router.post('/:id/restore', authorize('admin'), restore);

// Eliminación lógica (soft delete) de una tarea (solo Admin)
router.delete('/:id', authorize('admin'), remove);

export default router;
