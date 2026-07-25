import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import type { Coder, TeamLeader } from '../types';

// Estado de autenticación global con Zustand.
// Gestiona el usuario actual, el token JWT y las operaciones
// de login, registro, logout y verificación de sesión.
interface AuthState {
  user: (Coder & { role?: string }) | TeamLeader | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // True mientras se valida el token al cargar la app
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,

  // Login: llama a /api/auth/login, almacena token en localStorage
  // y actualiza el estado global de autenticación.
  login: async (email, password) => {
    const { user, token } = await authApi.login(email, password);
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  // Register: crea una cuenta nueva con rol 'coder' por defecto,
  // almacena el token recibido y actualiza el estado de autenticación.
  // Solo los coders pueden registrarse desde el formulario público.
  register: async (name, email, password) => {
    const { user, token } = await authApi.register(name, email, password, 'coder');
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  // Logout: elimina el token del localStorage y resetea todo
  // el estado de autenticación a valores por defecto.
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Verificar sesión: se ejecuta al cargar la app (App.tsx).
  // Si existe un token en localStorage, valida contra /api/auth/me
  // para confirmar que sigue siendo válido. Si falla, limpia la sesión.
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
