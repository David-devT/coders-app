import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import type { TaskStatus } from '../types';

// Hook personalizado para operaciones CRUD de Tareas con React Query
export const useTasks = () => {
  const queryClient = useQueryClient();

  // Query: obtener lista de tareas (se cachea con key 'tasks')
  const tasks = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
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

  // Mutación: eliminar tarea → invalida caché de 'tasks'
  const deleteTask = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return { tasks, createTask, updateTaskStatus, updateTask, deleteTask };
};
