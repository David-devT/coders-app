import NotificationModel from '../models/Notification.js';
import ClanModel from '../models/Clan.js';
import TeamLeaderModel from '../models/TeamLeader.js';

// Retorna las notificaciones y conteo de no leídas para un usuario
export const getUserNotifications = (userId) => {
  const notifications = NotificationModel.getByUserId(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount };
};

// Marca una notificación como leída
export const markNotificationAsRead = (id, userId) => {
  return NotificationModel.markAsRead(id, userId);
};

// Marca todas las notificaciones del usuario como leídas
export const markAllNotificationsAsRead = (userId) => {
  return NotificationModel.markAllAsRead(userId);
};

// Elimina una notificación individual
export const deleteNotification = (id, userId) => {
  return NotificationModel.delete(id, userId);
};

// Elimina todas las notificaciones de un usuario
export const deleteAllNotifications = (userId) => {
  return NotificationModel.deleteAll(userId);
};

// Emite una notificación cuando un Coder envía una tarea a Review
export const notifyTaskSubmittedForReview = (task, actor) => {
  if (!task) return;
  // Si la tarea tiene clan asignado, notificar al Team Leader del clan
  if (task.clanId) {
    const clan = ClanModel.getById(task.clanId);
    if (clan && clan.teamLeaderId && clan.teamLeaderId !== actor.id) {
      NotificationModel.create({
        userId: clan.teamLeaderId,
        title: 'Nueva Task en Review',
        message: `${actor.name || 'Un coder'} envió la tarea "${task.title}" a revisión.`,
        type: 'info',
        link: '/tasks',
      });
    }
  }

  // Notificar también a los administradores (si no son el propio actor)
  const admins = TeamLeaderModel.getAll().filter((u) => u.role === 'admin' && u.id !== actor.id);
  admins.forEach((admin) => {
    NotificationModel.create({
      userId: admin.id,
      title: 'Task en Review',
      message: `${actor.name || 'Un coder'} envió "${task.title}" a revisión.`,
      type: 'info',
      link: '/tasks',
    });
  });
};

// Emite una notificación al Coder cuando su tarea es aprobada o rechazada
export const notifyTaskDecision = (task, status, actor, feedback) => {
  if (!task || !task.assigneeId || task.assigneeId === actor.id) return;
  const isApproved = status === 'approved';

  NotificationModel.create({
    userId: task.assigneeId,
    title: isApproved ? '¡Task Aprobada!' : 'Task Rechazada / Requiere Correcciones',
    message: isApproved
      ? `Tu tarea "${task.title}" fue aprobada por ${actor.name}.${feedback ? ` Nota: "${feedback}"` : ''}`
      : `Tu tarea "${task.title}" fue rechazada por ${actor.name}.${feedback ? ` Motivo: "${feedback}"` : ''}`,
    type: isApproved ? 'success' : 'warning',
    link: '/tasks',
  });
};
