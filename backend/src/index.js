import dotenv from 'dotenv';
dotenv.config();

import app from './server.js';
import connectDB from './config/db.js';

const PORT = process.env.APP_PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
