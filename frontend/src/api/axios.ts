import axios from 'axios';

// Instancia centralizada de Axios con base URL /api (proxy a backend en dev)
const api = axios.create({
  baseURL: '/api',
});

// Interceptor de request:
// Se ejecuta antes de cada petición HTTP. Inyecta el token JWT
// almacenado en localStorage dentro del header Authorization.
// Así el backend puede identificar al usuario en cada petición.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response:
// Se ejecuta después de cada respuesta HTTP. Si el servidor responde
// con 401 (no autorizado), limpia el token y redirige al login.
// Excepción: en las rutas /auth/login y /auth/register NO redirige,
// porque el 401 indica credenciales inválidas y el componente
// LoginPage se encarga de mostrar el error al usuario.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
