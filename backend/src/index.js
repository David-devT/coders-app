import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';
import { initDatabase } from './config/initDatabase.js';

// Puerto de ejecución del servidor
const PORT = Number(process.env.APP_PORT) || 3000;

// Inicializa y valida la base de datos y cuentas demo antes de recibir solicitudes
await initDatabase();

// Inicia el servidor Express escuchando en la interfaz de red local si no está en entorno serverless
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Coders App Server listening on http://127.0.0.1:${PORT}`);
  });
}

export default app;
