import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import type { Coder, TeamLeader } from '../types';

// Estado de autenticación global con Zustand
interface AuthState {
  user: (Coder & { role?: string }) | TeamLeader | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // True mientras se valida el token al cargar la app
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,

  // Login: llama a /api/auth/login, almacena token en localStorage y actualiza estado
  login: async (email, password) => {
    const { user, token } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  // Logout: limpia token del localStorage y resetea estado de autenticación
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Verificar sesión: valida token existente contra /api/auth/me al cargar la app
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token inválido o expirado: limpiar sesión
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
