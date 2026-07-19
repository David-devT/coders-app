import api from './axios';
import type { ApiResponse, Clan } from '../types';

export const clansApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Clan[]>>('/clans');
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Clan>>(`/clans/${id}`);
    return data.data;
  },

  create: async (clan: { name: string; description?: string; teamLeader?: string }) => {
    const { data } = await api.post<ApiResponse<Clan>>('/clans', clan);
    return data.data;
  },

  update: async (id: string, clan: Partial<Clan>) => {
    const { data } = await api.put<ApiResponse<Clan>>(`/clans/${id}`, clan);
    return data.data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/clans/${id}`);
    return data.data;
  },
};
