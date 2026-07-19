import api from './axios';
import type { ApiResponse, TeamLeader } from '../types';

export const teamLeadersApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<TeamLeader[]>>('/team-leaders');
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<TeamLeader>>(`/team-leaders/${id}`);
    return data.data;
  },

  create: async (tl: { name: string; email: string; password: string; role?: string }) => {
    const { data } = await api.post<ApiResponse<TeamLeader>>('/team-leaders', tl);
    return data.data;
  },

  update: async (id: string, tl: Partial<TeamLeader>) => {
    const { data } = await api.put<ApiResponse<TeamLeader>>(`/team-leaders/${id}`, tl);
    return data.data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/team-leaders/${id}`);
    return data.data;
  },
};
