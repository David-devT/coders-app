import bcrypt from 'bcryptjs';
import CoderModel from '../models/Coder.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import ClanModel from '../models/Clan.js';
import TaskModel from '../models/Task.js';

const ALLOWED_UPDATE = ['name', 'email', 'password', 'clan'];

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

function enrich(coder) {
  if (!coder) return null;
  const s = sanitize(coder);
  if (s.clan) {
    const clan = ClanModel.getById(s.clan);
    s.clan = clan ? { id: clan.id, name: clan.name } : null;
  }
  return { ...s, role: 'coder' };
}

export const getAll = async () => {
  const coders = CoderModel.getAll();
  return coders.map(enrich);
};

export const getById = async (id) => {
  const coder = CoderModel.getById(id);
  return coder ? enrich(coder) : null;
};

export const create = async ({ name, email, password, clan }) => {
  if (!name || !name.trim()) throw new Error('Name is required');
  if (!email || !email.trim()) throw new Error('Email is required');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

  const normalizedEmail = email.trim().toLowerCase();
  const existingCoder = CoderModel.getByEmail(normalizedEmail);
  const existingTL = TeamLeaderModel.getByEmail(normalizedEmail);
  if (existingCoder || existingTL) {
    throw new Error('Email already registered');
  }

  let clanId = null;
  if (clan) {
    const targetClan = ClanModel.getById(clan);
    if (!targetClan) throw new Error('Target clan does not exist');
    clanId = targetClan.id;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const coder = CoderModel.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    clan: clanId,
  });

  // Bidirectional sync: add coder to clan
  if (clanId) {
    const targetClan = ClanModel.getById(clanId);
    if (targetClan && !targetClan.coders?.includes(coder.id)) {
      const updatedCoders = [...(targetClan.coders || []), coder.id];
      ClanModel.update(clanId, { coders: updatedCoders });
    }
  }

  return enrich(coder);
};

export const update = async (id, data) => {
  const current = CoderModel.getById(id);
  if (!current) throw new Error('Coder not found');

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

  // Handle Clan change sync
  if (safe.clan !== undefined && safe.clan !== current.clan) {
    // Remove from previous clan
    if (current.clan) {
      const oldClan = ClanModel.getById(current.clan);
      if (oldClan) {
        ClanModel.update(oldClan.id, {
          coders: (oldClan.coders || []).filter((cId) => cId !== id),
        });
      }
    }
    // Add to new clan
    if (safe.clan) {
      const newClan = ClanModel.getById(safe.clan);
      if (!newClan) throw new Error('Target clan does not exist');
      if (!newClan.coders?.includes(id)) {
        ClanModel.update(newClan.id, {
          coders: [...(newClan.coders || []), id],
        });
      }
    }
  }

  const updatedCoder = CoderModel.update(id, safe);
  return enrich(updatedCoder);
};

export const remove = async (id) => {
  const coder = CoderModel.remove(id);
  if (!coder) throw new Error('Coder not found');

  // Cascade 1: Remove coder from all clans
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.coders?.includes(id)) {
      ClanModel.update(clan.id, {
        coders: clan.coders.filter((cId) => cId !== id),
      });
    }
  }

  // Cascade 2: Unassign tasks
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.assigneeId === id) {
      TaskModel.update(task.id, { assigneeId: null });
    }
  }

  return sanitize(coder);
};
