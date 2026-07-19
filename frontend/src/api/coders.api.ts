import api from './axios';
import type { ApiResponse, Coder } from '../types';

export const codersApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<Coder[]>>('/coders');
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Coder>>(`/coders/${id}`);
    return data.data;
  },

  create: async (coder: { name: string; email: string; password: string; clan?: string }) => {
    const { data } = await api.post<ApiResponse<Coder>>('/coders', coder);
    return data.data;
  },

  update: async (id: string, coder: Partial<Coder>) => {
    const { data } = await api.put<ApiResponse<Coder>>(`/coders/${id}`, coder);
    return data.data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<ApiResponse<null>>(`/coders/${id}`);
    return data.data;
  },
};
