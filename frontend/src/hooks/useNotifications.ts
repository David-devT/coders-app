import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';
import { useAuthStore } from '../stores/authStore';

// Hook personalizado para suscripción y gestión del estado de notificaciones internas
export function useNotifications() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  // Consulta periódica de notificaciones (cada 30s) cuando el usuario tiene sesión activa
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getMyNotifications,
    enabled: !!token,
    refetchInterval: 30000,
  });

  // Mutación para marcar una notificación individual como leída
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutación para marcar todas las notificaciones como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutación para eliminar una notificación individual
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutación para eliminar todas las notificaciones del usuario
  const clearAllMutation = useMutation({
    mutationFn: notificationsApi.clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: notificationsQuery.data?.notifications || [],
    unreadCount: notificationsQuery.data?.unreadCount || 0,
    isLoading: notificationsQuery.isLoading,
    markAsRead: markAsReadMutation,
    markAllAsRead: markAllAsReadMutation,
    deleteNotification: deleteNotificationMutation,
    clearAll: clearAllMutation,
  };
}

