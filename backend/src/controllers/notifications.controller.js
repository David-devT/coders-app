import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationService,
  deleteAllNotifications as deleteAllNotificationsService,
} from '../services/notifications.service.js';

// Retorna todas las notificaciones del usuario en sesión
export const getMyNotifications = (req, res) => {
  try {
    const data = getUserNotifications(req.user.id);
    return res.json({ ok: true, data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
};

// Marca una notificación individual como leída
export const markAsRead = (req, res) => {
  try {
    const updated = markNotificationAsRead(req.params.id, req.user.id);
    if (!updated) {
      return res.status(404).json({ ok: false, message: 'Notificación no encontrada' });
    }
    return res.json({ ok: true, data: updated });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
};

// Marca todas las notificaciones del usuario como leídas
export const markAllAsRead = (req, res) => {
  try {
    const count = markAllNotificationsAsRead(req.user.id);
    return res.json({ ok: true, message: `${count} notificaciones marcadas como leídas` });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
};

// Elimina una notificación individual
export const deleteNotification = (req, res) => {
  try {
    const success = deleteNotificationService(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ ok: false, message: 'Notificación no encontrada' });
    }
    return res.json({ ok: true, message: 'Notificación eliminada correctamente' });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
};

// Elimina todas las notificaciones del usuario en sesión
export const clearAllNotifications = (req, res) => {
  try {
    const count = deleteAllNotificationsService(req.user.id);
    return res.json({ ok: true, message: `${count} notificaciones eliminadas exitosamente` });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
};

