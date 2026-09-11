import bcrypt from 'bcryptjs';
import TeamLeaderModel from '../models/TeamLeader.js';
import CoderModel from '../models/Coder.js';
import ClanModel from '../models/Clan.js';
import TaskModel from '../models/Task.js';

// Campos permitidos para actualización de líderes
const ALLOWED_UPDATE = ['name', 'email', 'password', 'role'];

// Filtra las propiedades permitidas en las actualizaciones
function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

// Remueve la contraseña del objeto retornado
function sanitize(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

// Resuelve y adjunta la lista de clanes liderados por este Team Leader
function enrich(tl) {
  if (!tl) return null;
  const s = sanitize(tl);
  const clans = ClanModel.getAll();
  s.clans = clans
    .filter((c) => c.teamLeader === s.id)
    .map((c) => ({ id: c.id, name: c.name }));
  return s;
}

// Retorna todos los líderes de equipo enriquecidos con sus clanes
export const getAll = async () => {
  const teamLeaders = TeamLeaderModel.getAll();
  return teamLeaders.map(enrich);
};

// Retorna un líder específico por su identificador
export const getById = async (id) => {
  const tl = TeamLeaderModel.getById(id);
  return tl ? enrich(tl) : null;
};

// Crea un nuevo líder validando email único y encriptando contraseña
export const create = async ({ name, email, password, role }) => {
  if (!name || !name.trim()) throw new Error('Name is required');
  if (!email || !email.trim()) throw new Error('Email is required');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

  const normalizedEmail = email.trim().toLowerCase();
  const existingCoder = CoderModel.getByEmail(normalizedEmail);
  const existingTL = TeamLeaderModel.getByEmail(normalizedEmail);
  if (existingCoder || existingTL) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const tl = TeamLeaderModel.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role || 'teamLeader',
  });

  return enrich(tl);
};

// Modifica los datos o rol de un líder y rehashea la clave si se actualizó
export const update = async (id, data) => {
  const current = TeamLeaderModel.getById(id);
  if (!current) throw new Error('Team Leader not found');

  const safe = pickAllowed(data, ALLOWED_UPDATE);

  if (safe.email) {
    const normalizedEmail = safe.email.trim().toLowerCase();
    if (normalizedEmail !== current.email.toLowerCase()) {
      const existingCoder = CoderModel.getByEmail(normalizedEmail);
      const existingTL = TeamLeaderModel.getByEmail(normalizedEmail);
      if (existingCoder || existingTL) {
        throw new Error('Email already registered');
      }
      safe.email = normalizedEmail;
    }
  }

  if (safe.password) {
    if (safe.password.trim().length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    safe.password = await bcrypt.hash(safe.password, 10);
  } else {
    delete safe.password;
  }

  const updatedTL = TeamLeaderModel.update(id, safe);
  return enrich(updatedTL);
};

// Elimina un líder, desasigna sus clanes y desvincula sus tareas en cascada
export const remove = async (id) => {
  const tl = TeamLeaderModel.remove(id);
  if (!tl) throw new Error('Team Leader not found');

  // Desasigna el rol de líder en los clanes dirigidos
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.teamLeader === id) {
      ClanModel.update(clan.id, { teamLeader: null });
    }
  }

  // Desasigna las tareas que tenía asignadas
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.assigneeId === id) {
      TaskModel.update(task.id, { assigneeId: null });
    }
  }

  return sanitize(tl);
};

// Asciende a un Coder al rol de Team Leader preservando sus credenciales y tareas
export const promote = async (coderId) => {
  if (!coderId) throw new Error('Coder ID is required');
  const coder = CoderModel.getById(coderId);
  if (!coder) throw new Error('Coder not found');

  const existingTL = TeamLeaderModel.getByEmail(coder.email);
  if (existingTL) throw new Error('Email already registered as team leader');

  // Crea el registro en Team Leaders transfiriendo el hash de contraseña
  const tl = TeamLeaderModel.create({
    name: coder.name,
    email: coder.email,
    password: coder.password,
    role: 'teamLeader',
  });

  // Reasigna las tareas técnicas al nuevo identificador
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.assigneeId === coderId) {
      TaskModel.update(task.id, { assigneeId: tl.id });
    }
  }

  // Desvincula al coder de la lista de miembros de su clan
  if (coder.clan) {
    const clan = ClanModel.getById(coder.clan);
    if (clan && Array.isArray(clan.coders)) {
      ClanModel.update(clan.id, {
        coders: clan.coders.filter((cId) => cId !== coderId),
      });
    }
  }

  // Elimina el registro anterior de coder
  CoderModel.remove(coderId);

  return enrich(tl);
};

// Degrada a un Team Leader al rol de Coder preservando sus tareas (bloquea administradores)
export const demote = async (tlId) => {
  if (!tlId) throw new Error('Team Leader ID is required');
  const tl = TeamLeaderModel.getById(tlId);
  if (!tl) throw new Error('Team Leader not found');

  if (tl.role === 'admin') {
    throw new Error('Cannot demote an admin');
  }

  const existingCoder = CoderModel.getByEmail(tl.email);
  if (existingCoder) throw new Error('Email already registered as coder');

  // Crea el registro de coder con el hash de contraseña existente
  const coder = CoderModel.create({
    name: tl.name,
    email: tl.email,
    password: tl.password,
    clan: null,
  });

  // Reasigna las tareas al nuevo ID de coder
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.assigneeId === tlId) {
      TaskModel.update(task.id, { assigneeId: coder.id });
    }
  }

  // Desasigna el liderazgo de clanes que dirigía
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.teamLeader === tlId) {
      ClanModel.update(clan.id, { teamLeader: null });
    }
  }

  // Elimina el registro de Team Leader
  TeamLeaderModel.remove(tlId);

  return { ...sanitize(coder), role: 'coder' };
};
