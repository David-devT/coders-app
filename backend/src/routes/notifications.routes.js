import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Todas las rutas de notificaciones requieren autenticación
router.use(authenticate);

// Consulta notificaciones del usuario autenticado
router.get('/', getMyNotifications);

// Marca todas las notificaciones como leídas
router.patch('/read-all', markAllAsRead);

// Marca una notificación específica como leída
router.patch('/:id/read', markAsRead);

// Elimina todas las notificaciones del usuario autenticado
router.delete('/clear-all', clearAllNotifications);

// Elimina una notificación específica por ID
router.delete('/:id', deleteNotification);

export default router;

