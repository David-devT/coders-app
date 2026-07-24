import api from './axios';
import type { ApiResponse, Coder } from '../types';

// API layer para operaciones CRUD de Coders
export const codersApi = {
  // GET /api/coders - Listar todos los coders
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Coder[]>>('/coders');
    return data.data;
  },

  // GET /api/coders/:id - Obtener un coder específico
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Coder>>(`/coders/${id}`);
    return data.data;
  },

  // POST /api/coders - Crear un nuevo coder
  create: async (coder: { name: string; email: string; password: string; clan?: string }) => {
    const { data } = await api.post<ApiResponse<Coder>>('/coders', coder);
    return data.data;
  },

  // PUT /api/coders/:id - Actualizar un coder existente
  update: async (id: string, coder: Partial<Coder>) => {
    const { data } = await api.put<ApiResponse<Coder>>(`/coders/${id}`, coder);
    return data.data;
  },

  // DELETE /api/coders/:id - Eliminar un coder
  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/coders/${id}`);
    return data.data;
  },
};
