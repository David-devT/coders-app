import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pushToSupabase, pullFromSupabase, isSupabaseConfigured } from '../config/supabase.js';

// Directorio base de almacenamiento de datos JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');

// Crea el directorio de datos si no existe en el sistema de archivos
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Lee una colección JSON del almacenamiento local y la convierte en arreglo de objetos
export function readJSON(filename) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return [];
  }
}

// Guarda una colección en disco en formato JSON y sincroniza con Supabase en segundo plano
export function writeJSON(filename, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    // Envía la actualización a Supabase de manera no bloqueante
    if (isSupabaseConfigured) {
      pushToSupabase(filename, data).catch((err) => {
        console.warn(`Supabase sync warning for ${filename}:`, err.message);
      });
    }
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw error;
  }
}

// Sincroniza y actualiza la caché de datos local desde las tablas de Supabase
export async function syncAllFromSupabase() {
  if (!isSupabaseConfigured) return false;

  const data = await pullFromSupabase();
  if (!data) return false;

  ensureDataDir();

  // Escribe el archivo en disco únicamente si el contenido ha cambiado
  const writeIfChanged = (filename, obj) => {
    const filePath = path.join(DATA_DIR, filename);
    const newContent = JSON.stringify(obj, null, 2);
    if (fs.existsSync(filePath)) {
      const current = fs.readFileSync(filePath, 'utf-8');
      if (current === newContent) return;
    }
    fs.writeFileSync(filePath, newContent, 'utf-8');
  };

  if (data.teamLeaders && data.teamLeaders.length > 0) {
    writeIfChanged('teamLeaders.json', data.teamLeaders);
  }
  if (data.clans) {
    writeIfChanged('clans.json', data.clans);
  }
  if (data.coders) {
    writeIfChanged('coders.json', data.coders);
  }
  if (data.tasks) {
    writeIfChanged('tasks.json', data.tasks);
  }

  return true;
}
