import bcrypt from 'bcryptjs';
import TeamLeaderModel from '../models/TeamLeader.js';
import CoderModel from '../models/Coder.js';
import ClanModel from '../models/Clan.js';
import TaskModel from '../models/Task.js';

const ALLOWED_UPDATE = ['name', 'email', 'password', 'role'];

function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

function sanitize(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

function enrich(tl) {
  if (!tl) return null;
  const s = sanitize(tl);
  const clans = ClanModel.getAll();
  s.clans = clans
    .filter((c) => c.teamLeader === s.id)
    .map((c) => ({ id: c.id, name: c.name }));
  return s;
}

export const getAll = async () => {
  const teamLeaders = TeamLeaderModel.getAll();
  return teamLeaders.map(enrich);
};

export const getById = async (id) => {
  const tl = TeamLeaderModel.getById(id);
  return tl ? enrich(tl) : null;
};

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

export const remove = async (id) => {
  const tl = TeamLeaderModel.remove(id);
  if (!tl) throw new Error('Team Leader not found');

  // Cascade 1: Unset teamLeader in all led clans
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.teamLeader === id) {
      ClanModel.update(clan.id, { teamLeader: null });
    }
  }

  // Cascade 2: Unassign tasks
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.assigneeId === id) {
      TaskModel.update(task.id, { assigneeId: null });
    }
  }

  return sanitize(tl);
};

export const promote = async (coderId) => {
  if (!coderId) throw new Error('Coder ID is required');
  const coder = CoderModel.getById(coderId);
  if (!coder) throw new Error('Coder not found');

  const existingTL = TeamLeaderModel.getByEmail(coder.email);
  if (existingTL) throw new Error('Email already registered as team leader');

  // Create TL with coder's existing password hash
  const tl = TeamLeaderModel.create({
    name: coder.name,
    email: coder.email,
    password: coder.password,
    role: 'teamLeader',
  });

  // Migrate tasks assigned to the coder to the new TL id
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.assigneeId === coderId) {
      TaskModel.update(task.id, { assigneeId: tl.id });
    }
  }

  // Remove coder from their clan if assigned
  if (coder.clan) {
    const clan = ClanModel.getById(coder.clan);
    if (clan && Array.isArray(clan.coders)) {
      ClanModel.update(clan.id, {
        coders: clan.coders.filter((cId) => cId !== coderId),
      });
    }
  }

  // Delete coder
  CoderModel.remove(coderId);

  return enrich(tl);
};

export const demote = async (tlId) => {
  if (!tlId) throw new Error('Team Leader ID is required');
  const tl = TeamLeaderModel.getById(tlId);
  if (!tl) throw new Error('Team Leader not found');

  if (tl.role === 'admin') {
    throw new Error('Cannot demote an admin');
  }

  const existingCoder = CoderModel.getByEmail(tl.email);
  if (existingCoder) throw new Error('Email already registered as coder');

  // Create Coder with TL's existing password hash
  const coder = CoderModel.create({
    name: tl.name,
    email: tl.email,
    password: tl.password,
    clan: null,
  });

  // Migrate tasks assigned to the TL to the new Coder id
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.assigneeId === tlId) {
      TaskModel.update(task.id, { assigneeId: coder.id });
    }
  }

  // Dissociate TL from all clans
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.teamLeader === tlId) {
      ClanModel.update(clan.id, { teamLeader: null });
    }
  }

  // Delete TL
  TeamLeaderModel.remove(tlId);

  return { ...sanitize(coder), role: 'coder' };
};
