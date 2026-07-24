import axios from 'axios';

// Instancia centralizada de Axios con base URL /api (proxy a backend en dev)
const api = axios.create({
  baseURL: '/api',
});

// Interceptor de request: inyecta token JWT del localStorage en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: en caso de 401 limpia token y redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
