import api from './axios';
import type { ApiResponse, AuthResponse, Coder, TeamLeader } from '../types';

// API layer para operaciones de autenticación
export const authApi = {
  // POST /api/auth/login - Iniciar sesión con email y password
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return data.data;
  },

  // POST /api/auth/register - Registrar nuevo usuario con rol opcional
  register: async (name: string, email: string, password: string, role?: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password, role });
    return data.data;
  },

  // GET /api/auth/me - Obtener perfil del usuario autenticado (requiere token)
  getMe: async () => {
    const { data } = await api.get<ApiResponse<Coder | TeamLeader>>('/auth/me');
    return data.data;
  },
};
