import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import codersRoutes from './routes/coders.routes.js';
import clansRoutes from './routes/clans.routes.js';
import teamLeadersRoutes from './routes/teamLeaders.routes.js';
import tasksRoutes from './routes/tasks.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coders', codersRoutes);
app.use('/api/clans', clansRoutes);
app.use('/api/team-leaders', teamLeadersRoutes);
app.use('/api/tasks', tasksRoutes);

// Static frontend build serving for production
const publicDir = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// 404 handler for unhandled /api endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, message: 'Endpoint not found' });
});

// SPA fallback for non-API routes in production
app.use((req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ ok: false, message: 'Resource not found' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
