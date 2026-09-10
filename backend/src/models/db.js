import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pushToSupabase, pullFromSupabase, isSupabaseConfigured } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');

/**
 * Ensures the data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Reads a JSON file from the data directory.
 * Returns an array of items or an empty array if file does not exist or fails to parse.
 * @param {string} filename 
 * @returns {Array<any>}
 */
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

/**
 * Writes an array of items to a JSON file and asynchronously synchronizes with Supabase.
 * @param {string} filename 
 * @param {Array<any>} data 
 */
export function writeJSON(filename, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    // Sync to Supabase in background
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

/**
 * Synchronizes local database cache from live Supabase instance.
 */
export async function syncAllFromSupabase() {
  if (!isSupabaseConfigured) return false;

  const data = await pullFromSupabase();
  if (!data) return false;

  ensureDataDir();

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
