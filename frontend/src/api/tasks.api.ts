import api from './axios';
import type { ApiResponse, Task, TaskStatus } from '../types';

// API layer para operaciones CRUD de Tareas
export const tasksApi = {
  // GET /api/tasks - Listar tareas (filtrado por rol en backend)
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Task[]>>('/tasks');
    return data.data;
  },

  // GET /api/tasks/:id - Obtener una tarea específica
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data;
  },

  // POST /api/tasks - Crear una nueva tarea (solo teamLeader/admin)
  create: async (task: { title: string; description?: string; priority: string; assigneeId: string; clanId?: string }) => {
    const { data } = await api.post<ApiResponse<Task>>('/tasks', task);
    return data.data;
  },

  // PATCH /api/tasks/:id/status - Cambiar estado de la tarea
  updateStatus: async (id: string, status: TaskStatus) => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return data.data;
  },

  // PUT /api/tasks/:id - Actualizar una tarea existente
  update: async (id: string, task: Partial<Task>) => {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, task);
    return data.data;
  },

  // DELETE /api/tasks/:id - Eliminar una tarea
  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
    return data.data;
  },
};
