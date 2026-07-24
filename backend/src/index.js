import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';

// Punto de entrada: carga variables de entorno y arranca el servidor
const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
