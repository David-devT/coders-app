import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'teamLeaders.json';

const TeamLeaderModel = {
  getAll() {
    return readJSON(FILE);
  },

  getById(id) {
    if (!id) return null;
    const teamLeaders = readJSON(FILE);
    return teamLeaders.find((t) => t.id === id) || null;
  },

  getByEmail(email) {
    if (!email) return null;
    const teamLeaders = readJSON(FILE);
    const normalized = email.trim().toLowerCase();
    return teamLeaders.find((t) => t.email && t.email.toLowerCase() === normalized) || null;
  },

  create(data) {
    const teamLeaders = readJSON(FILE);
    const now = new Date().toISOString();
    const newTL = {
      id: data.id || uuidv4(),
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      role: data.role || 'teamLeader',
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    teamLeaders.push(newTL);
    writeJSON(FILE, teamLeaders);
    return newTL;
  },

  update(id, data) {
    const teamLeaders = readJSON(FILE);
    const index = teamLeaders.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = teamLeaders[index];
    const updated = {
      ...current,
      ...data,
      email: data.email !== undefined ? data.email.trim().toLowerCase() : current.email,
      name: data.name !== undefined ? data.name.trim() : current.name,
      updatedAt: new Date().toISOString(),
    };

    teamLeaders[index] = updated;
    writeJSON(FILE, teamLeaders);
    return updated;
  },

  remove(id) {
    const teamLeaders = readJSON(FILE);
    const index = teamLeaders.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const [deleted] = teamLeaders.splice(index, 1);
    writeJSON(FILE, teamLeaders);
    return deleted;
  },
};

export default TeamLeaderModel;
