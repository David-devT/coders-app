import bcrypt from 'bcryptjs';
import TeamLeaderModel from '../models/TeamLeader.js';
import CoderModel from '../models/Coder.js';
import { seed } from '../scripts/seed.js';
import { writeJSON, syncAllFromSupabase } from '../models/db.js';
import { isSupabaseConfigured } from './supabase.js';

/**
 * Ensures the database has valid demo accounts and correct password hashes.
 * Synchronizes with Supabase if configured.
 */
export async function initDatabase() {
  try {
    // 1. Sync from Supabase if connected
    if (isSupabaseConfigured) {
      console.log('☁️ Conectando con Supabase...');
      const synced = await syncAllFromSupabase();
      if (synced) {
        console.log('✅ Base de datos sincronizada con Supabase exitosamente.');
      } else {
        console.log('ℹ️ Usando almacenamiento local (Supabase no respondió o está vacío).');
      }
    }

    // 2. Check and initialize local accounts
    const teamLeaders = TeamLeaderModel.getAll();
    const admin = teamLeaders.find((t) => t.role === 'admin' || t.email === 'admin@coders.app');
    const coders = CoderModel.getAll();

    // If no admin exists or database is empty or no coders exist, seed initial data
    if (!admin || teamLeaders.length === 0 || coders.length === 0) {
      console.log('⚡ Base de datos incompleta o sin coders. Inicializando cuentas por defecto...');
      await seed();
      return;
    }

    // Verify admin password hash matches Admin123!
    const adminMatch = bcrypt.compareSync('Admin123!', admin.password);
    if (!adminMatch) {
      console.log('🔄 Actualizando credencial de admin@coders.app a Admin123!...');
      const newHash = await bcrypt.hash('Admin123!', 10);
      TeamLeaderModel.update(admin.id, { password: newHash, role: 'admin' });
    }

    // Verify team leader password hash
    const tl = TeamLeaderModel.getByEmail('alex.tl@coders.app');
    if (tl && !bcrypt.compareSync('Tl123!', tl.password)) {
      console.log('🔄 Actualizando credencial de alex.tl@coders.app a Tl123!...');
      const tlHash = await bcrypt.hash('Tl123!', 10);
      TeamLeaderModel.update(tl.id, { password: tlHash });
    }

    // Verify coder password hashes
    const currentCoders = CoderModel.getAll();
    for (const coder of currentCoders) {
      if ((coder.email === 'elena@coders.app' || coder.email === 'mateo@coders.app') && !bcrypt.compareSync('Coder123!', coder.password)) {
        const coderHash = await bcrypt.hash('Coder123!', 10);
        CoderModel.update(coder.id, { password: coderHash });
      }
    }
  } catch (error) {
    console.error('⚠️ Advertencia en initDatabase:', error.message);
  }
}
