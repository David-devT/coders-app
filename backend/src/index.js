import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Coders App Server listening on port ${PORT}`);
});
