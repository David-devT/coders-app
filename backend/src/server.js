import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import codersRoutes from './routes/coders.routes.js';
import clansRoutes from './routes/clans.routes.js';
import teamLeadersRoutes from './routes/teamLeaders.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

// Resolución de rutas de directorio en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cabeceras HTTP de seguridad
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Configuración de CORS para orígenes permitidos
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173'] : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Parseo de cuerpo de solicitudes en formato JSON
app.use(express.json());

// Limitador de intentos para prevenir ataques de fuerza bruta en login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    ok: false,
    message: 'Demasiados intentos de acceso desde esta IP. Por favor intenta en 15 minutos.',
  },
});
app.use('/api/auth/login', loginLimiter);

// Enrutamiento de los módulos de la API
app.use('/api/auth', authRoutes);
app.use('/api/coders', codersRoutes);
app.use('/api/clans', clansRoutes);
app.use('/api/team-leaders', teamLeadersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/notifications', notificationsRoutes);

// Servidor de archivos estáticos del frontend compilado en producción
const publicDir = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Manejador 404 para rutas de la API no encontradas
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, message: 'Endpoint not found' });
});

// Redirección de rutas SPA hacia el index.html en producción
app.use((req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ ok: false, message: 'Resource not found' });
  }
});

// Manejador global centralizado de errores del servidor
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
