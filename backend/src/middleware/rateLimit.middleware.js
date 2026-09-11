import rateLimit from 'express-rate-limit';

// Limitador de peticiones para rutas de autenticación (Login y Registro) para mitigar ataques de fuerza bruta
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: process.env.NODE_ENV === 'test' ? 1000 : 50, // Límite flexible en pruebas para evitar falsos positivos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados intentos de autenticación desde esta dirección IP. Intente de nuevo más tarde.',
  },
});
