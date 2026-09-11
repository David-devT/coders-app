import app from '../backend/src/server.js';
import { initDatabase } from '../backend/src/config/initDatabase.js';

let isInitialized = false;

// Handler serverless para Vercel
export default async function handler(req, res) {
  if (!isInitialized) {
    try {
      await initDatabase();
    } catch (error) {
      console.error('Error inicializando base de datos en Vercel:', error);
    }
    isInitialized = true;
  }
  return app(req, res);
}
