import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import codersRoutes from './routes/coders.routes.js';
import clansRoutes from './routes/clans.routes.js';
import teamLeadersRoutes from './routes/teamLeaders.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/coders', codersRoutes);
app.use('/api/clans', clansRoutes);
app.use('/api/team-leaders', teamLeadersRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

export default app;
