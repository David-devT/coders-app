import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'notifications.json';

const NotificationModel = {
  // Obtiene todas las notificaciones de un usuario ordenadas de más reciente a más antigua
  getByUserId(userId) {
    if (!userId) return [];
    return readJSON(FILE)
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Registra una nueva notificación interna para un usuario
  create(data) {
    const notifications = readJSON(FILE);
    const newNotification = {
      id: data.id || uuidv4(),
      userId: data.userId,
      title: data.title?.trim(),
      message: data.message?.trim(),
      type: data.type || 'info', // 'info' | 'success' | 'warning' | 'alert'
      read: false,
      link: data.link || null,
      createdAt: data.createdAt || new Date().toISOString(),
    };
    notifications.push(newNotification);
    writeJSON(FILE, notifications);
    return newNotification;
  },

  // Marca una notificación individual como leída
  markAsRead(id, userId) {
    const notifications = readJSON(FILE);
    const index = notifications.findIndex((n) => n.id === id && n.userId === userId);
    if (index === -1) return null;

    notifications[index].read = true;
    writeJSON(FILE, notifications);
    return notifications[index];
  },

  // Marca todas las notificaciones pendientes de un usuario como leídas
  markAllAsRead(userId) {
    const notifications = readJSON(FILE);
    let count = 0;
    notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    });
    if (count > 0) {
      writeJSON(FILE, notifications);
    }
    return count;
  },

  // Elimina una notificación individual perteneciente al usuario
  delete(id, userId) {
    const notifications = readJSON(FILE);
    const index = notifications.findIndex((n) => n.id === id && n.userId === userId);
    if (index === -1) return false;

    notifications.splice(index, 1);
    writeJSON(FILE, notifications);
    return true;
  },

  // Elimina todas las notificaciones pertenecientes al usuario
  deleteAll(userId) {
    const notifications = readJSON(FILE);
    const initialLength = notifications.length;
    const remaining = notifications.filter((n) => n.userId !== userId);
    const count = initialLength - remaining.length;
    if (count > 0) {
      writeJSON(FILE, remaining);
    }
    return count;
  },
};

export default NotificationModel;

