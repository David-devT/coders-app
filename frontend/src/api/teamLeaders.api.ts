import api from './axios';
import type { ApiResponse, TeamLeader } from '../types';

// API layer para operaciones CRUD de Team Leaders
export const teamLeadersApi = {
  // GET /api/team-leaders - Listar todos los team leaders (solo admin)
  getAll: async () => {
    const { data } = await api.get<ApiResponse<TeamLeader[]>>('/team-leaders');
    return data.data;
  },

  // GET /api/team-leaders/:id - Obtener un team leader específico
  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<TeamLeader>>(`/team-leaders/${id}`);
    return data.data;
  },

  // POST /api/team-leaders - Crear un nuevo team leader
  create: async (tl: { name: string; email: string; password: string; role?: string }) => {
    const { data } = await api.post<ApiResponse<TeamLeader>>('/team-leaders', tl);
    return data.data;
  },

  // PUT /api/team-leaders/:id - Actualizar un team leader existente
  update: async (id: string, tl: Partial<TeamLeader>) => {
    const { data } = await api.put<ApiResponse<TeamLeader>>(`/team-leaders/${id}`, tl);
    return data.data;
  },

  // DELETE /api/team-leaders/:id - Eliminar un team leader
  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/team-leaders/${id}`);
    return data.data;
  },

  // POST /api/team-leaders/promote - Promover un coder a team leader
  promote: async (coderId: string) => {
    const { data } = await api.post<ApiResponse<TeamLeader>>('/team-leaders/promote', { coderId });
    return data.data;
  },

  // POST /api/team-leaders/demote - Degradar un team leader a coder
  demote: async (tlId: string) => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>('/team-leaders/demote', { tlId });
    return data.data;
  },
};
