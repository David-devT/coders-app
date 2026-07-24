import api from './axios';
import type { ApiResponse, Clan } from '../types';

// API layer para operaciones CRUD de Clans
export const clansApi = {
  // GET /api/clans - Listar todos los clans
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Clan[]>>('/clans');
    return data.data;
  },

  // GET /api/clans/:id - Obtener un clan específico
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Clan>>(`/clans/${id}`);
    return data.data;
  },

  // POST /api/clans - Crear un nuevo clan
  create: async (clan: { name: string; description?: string; teamLeader?: string }) => {
    const { data } = await api.post<ApiResponse<Clan>>('/clans', clan);
    return data.data;
  },

  // PUT /api/clans/:id - Actualizar un clan existente
  update: async (id: string, clan: Partial<Clan>) => {
    const { data } = await api.put<ApiResponse<Clan>>(`/clans/${id}`, clan);
    return data.data;
  },

  // DELETE /api/clans/:id - Eliminar un clan
  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/clans/${id}`);
    return data.data;
  },
};
