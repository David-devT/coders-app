import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import codersRoutes from './routes/coders.routes.js';
import clansRoutes from './routes/clans.routes.js';
import teamLeadersRoutes from './routes/teamLeaders.routes.js';

// Resolución de __dirname en módulos ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middlewares globales: CORS habilitado y parsing de JSON
app.use(cors());
app.use(express.json());

// Registro de rutas de la API bajo /api
app.use('/api/auth', authRoutes);
app.use('/api/coders', codersRoutes);
app.use('/api/clans', clansRoutes);
app.use('/api/team-leaders', teamLeadersRoutes);

// Servir el build estático del frontend en producción
const publicDir = path.join(__dirname, '../../frontend/dist');
app.use(express.static(publicDir));

// Fallback SPA: cualquier ruta no API devuelve index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Manejador global de errores no capturados
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

export default app;
