import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';
import { initDatabase } from './config/initDatabase.js';

const PORT = Number(process.env.APP_PORT) || 3000;

// Inicializar y verificar cuentas por defecto antes de aceptar conexiones
await initDatabase();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Coders App Server listening on http://127.0.0.1:${PORT}`);
});
