import api from './axios';
import type { ApiResponse, NotificationsData, NotificationItem } from '../types';

// Capa de comunicación con la API de notificaciones internas
export const notificationsApi = {
  // Consulta las notificaciones y el conteo de no leídas del usuario
  getMyNotifications: async () => {
    const { data } = await api.get<ApiResponse<NotificationsData>>('/notifications');
    return data.data;
  },

  // Marca una notificación específica como leída
  markAsRead: async (id: string) => {
    const { data } = await api.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return data.data;
  },

  // Marca todas las notificaciones pendientes como leídas
  markAllAsRead: async () => {
    const { data } = await api.patch<ApiResponse<{ message: string }>>('/notifications/read-all');
    return data.data;
  },

  // Elimina una notificación específica por su ID
  deleteNotification: async (id: string) => {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`);
    return data.data;
  },

  // Elimina todas las notificaciones del usuario
  clearAllNotifications: async () => {
    const { data } = await api.delete<ApiResponse<{ message: string }>>('/notifications/clear-all');
    return data.data;
  },
};

