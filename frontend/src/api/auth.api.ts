import api from './axios';
import type { ApiResponse, AuthResponse, Coder, TeamLeader } from '../types';

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return data.data;
  },

  register: async (name: string, email: string, password: string, role?: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password, role });
    return data.data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<Coder | TeamLeader>>('/auth/me');
    return data.data;
  },
};
