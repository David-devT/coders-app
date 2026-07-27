import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import type { TaskStatus } from '../types';

// Hook personalizado para operaciones CRUD de Tareas con React Query.
// Incluye queries para tareas activas y eliminadas, y mutaciones para
// crear, actualizar, eliminar (soft delete) y restaurar tareas.
// @param showDeleted - Si es true, habilita la query de tareas eliminadas (lazy loading).
export const useTasks = (showDeleted = false) => {
  const queryClient = useQueryClient();

  // Query: obtener lista de tareas activas (se cachea con key 'tasks')
  const tasks = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  });

  // Query: obtener tareas eliminadas (lazy - solo se ejecuta cuando se abre el panel)
  const tasksDeleted = useQuery({
    queryKey: ['tasksDeleted'],
    queryFn: tasksApi.getDeleted,
    enabled: showDeleted,
  });

  // Mutación: crear tarea → invalida caché de 'tasks'
  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // Mutación: actualizar estado de tarea → invalida caché de 'tasks'
  const updateTaskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // Mutación: actualizar tarea → invalida caché de 'tasks'
  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      tasksApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // Mutación: eliminar tarea (soft delete) → invalida ambas cachés
  const deleteTask = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksDeleted'] });
    },
  });

  // Mutación: restaurar tarea eliminada → invalida ambas cachés
  const restoreTask = useMutation({
    mutationFn: tasksApi.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasksDeleted'] });
    },
  });

  return { tasks, tasksDeleted, createTask, updateTaskStatus, updateTask, deleteTask, restoreTask };
};
