import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

// Lectura de credenciales de conexión con la nube de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

// Bandera que verifica si Supabase está configurado con credenciales válidas
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Instancia cliente de conexión con Supabase sin persistencia de sesión en servidor
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Descarga todas las tablas desde Supabase y las transforma al formato de modelos de la aplicación
export async function pullFromSupabase() {
  if (!supabase) return null;

  try {
    // Consulta en paralelo de las 4 colecciones principales
    const [tlsRes, clansRes, codersRes, tasksRes] = await Promise.all([
      supabase.from('team_leaders').select('*'),
      supabase.from('clans').select('*'),
      supabase.from('coders').select('*'),
      supabase.from('tasks').select('*'),
    ]);

    if (tlsRes.error || clansRes.error || codersRes.error || tasksRes.error) {
      console.warn('⚠️ Error al consultar datos en Supabase:', {
        tls: tlsRes.error?.message,
        clans: clansRes.error?.message,
        coders: codersRes.error?.message,
        tasks: tasksRes.error?.message,
      });
      return null;
    }

    // Mapeo de columnas de base de datos a objetos de modelo en camelCase
    const coders = (codersRes.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      password: c.password,
      clan: c.clan_id,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    const clans = (clansRes.data || []).map((clan) => ({
      id: clan.id,
      name: clan.name,
      description: clan.description,
      teamLeader: clan.team_leader_id,
      coders: coders.filter((c) => c.clan === clan.id).map((c) => c.id),
      createdAt: clan.created_at,
      updatedAt: clan.updated_at,
    }));

    const teamLeaders = (tlsRes.data || []).map((tl) => ({
      id: tl.id,
      name: tl.name,
      email: tl.email,
      password: tl.password,
      role: tl.role,
      createdAt: tl.created_at,
      updatedAt: tl.updated_at,
    }));

    const tasks = (tasksRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assignee_id,
      clanId: t.clan_id,
      dueDate: t.due_date || t.dueDate || null,
      feedback: t.feedback || null,
      githubUrl: t.github_url || t.githubUrl || null,
      history: Array.isArray(t.history) ? t.history : [],
      deleted: Boolean(t.deleted),
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    return { teamLeaders, clans, coders, tasks };
  } catch (error) {
    console.error('⚠️ Error al sincronizar desde Supabase:', error.message);
    return null;
  }
}

// Sube los cambios de una colección local hacia la tabla correspondiente en Supabase
export async function pushToSupabase(filename, data) {
  if (!supabase) return;

  try {
    // Sincronización de líderes de equipo (upsert y eliminación de registros obsoletos)
    if (filename === 'teamLeaders.json') {
      const rows = data.map((tl) => ({
        id: tl.id,
        name: tl.name,
        email: tl.email,
        password: tl.password,
        role: tl.role,
        created_at: tl.createdAt,
        updated_at: tl.updatedAt,
      }));
      if (rows.length > 0) {
        await supabase.from('team_leaders').upsert(rows);
      }
      const currentIds = data.map((d) => d.id);
      if (currentIds.length > 0) {
        await supabase.from('team_leaders').delete().not('id', 'in', `(${currentIds.join(',')})`);
      }
    // Sincronización de clanes
    } else if (filename === 'clans.json') {
      const rows = data.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        team_leader_id: c.teamLeader || null,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      }));
      if (rows.length > 0) {
        await supabase.from('clans').upsert(rows);
      }
      const currentIds = data.map((d) => d.id);
      if (currentIds.length > 0) {
        await supabase.from('clans').delete().not('id', 'in', `(${currentIds.join(',')})`);
      }
    // Sincronización de programadores (coders)
    } else if (filename === 'coders.json') {
      const rows = data.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        password: c.password,
        clan_id: c.clan || null,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      }));
      if (rows.length > 0) {
        await supabase.from('coders').upsert(rows);
      }
      const currentIds = data.map((d) => d.id);
      if (currentIds.length > 0) {
        await supabase.from('coders').delete().not('id', 'in', `(${currentIds.join(',')})`);
      }
    // Sincronización de tareas y estados de kanban
    } else if (filename === 'tasks.json') {
      const rows = data.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignee_id: t.assigneeId || null,
        clan_id: t.clanId || null,
        due_date: t.dueDate || null,
        feedback: t.feedback || null,
        github_url: t.githubUrl || null,
        deleted: Boolean(t.deleted),
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      }));
      if (rows.length > 0) {
        await supabase.from('tasks').upsert(rows);
      }
      const currentIds = data.map((d) => d.id);
      if (currentIds.length > 0) {
        await supabase.from('tasks').delete().not('id', 'in', `(${currentIds.join(',')})`);
      }
    }
  } catch (error) {
    console.error(`⚠️ Error al sincronizar ${filename} con Supabase:`, error.message);
  }
}

export default supabase;
