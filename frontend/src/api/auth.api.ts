import api from './axios';
import type { ApiResponse, AuthResponse, Coder, TeamLeader } from '../types';

// Capa de API para todas las operaciones de autenticación.
// Cada función envía una petición HTTP al backend y devuelve
// solo la parte data de la respuesta (ApiResponse.data).
export const authApi = {
  // POST /api/auth/login - Inicia sesión con email y password.
  // Retorna un objeto con el usuario y el token JWT.
  // El token se almacena en localStorage por el authStore.
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return data.data;
  },

  // POST /api/auth/register - Registra un nuevo usuario.
  // El parámetro role es opcional, por defecto el backend asigna 'coder'.
  // Retorna un objeto con el usuario creado y el token JWT.
  register: async (name: string, email: string, password: string, role?: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password, role });
    return data.data;
  },

  // GET /api/auth/me - Obtiene el perfil del usuario autenticado.
  // Requiere un token JWT válido en el header Authorization.
  // Retorna los datos del usuario (Coder o TeamLeader) con info de su clan.
  getMe: async () => {
    const { data } = await api.get<ApiResponse<Coder | TeamLeader>>('/auth/me');
    return data.data;
  },
};
