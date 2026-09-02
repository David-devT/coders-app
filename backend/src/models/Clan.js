import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'clans.json';

const ClanModel = {
  getAll() {
    return readJSON(FILE);
  },

  getById(id) {
    if (!id) return null;
    const clans = readJSON(FILE);
    return clans.find((c) => c.id === id) || null;
  },

  getByName(name) {
    if (!name) return null;
    const clans = readJSON(FILE);
    const normalized = name.trim().toLowerCase();
    return clans.find((c) => c.name && c.name.toLowerCase() === normalized) || null;
  },

  create(data) {
    const clans = readJSON(FILE);
    const now = new Date().toISOString();
    const newClan = {
      id: data.id || uuidv4(),
      name: data.name?.trim(),
      description: data.description?.trim() || '',
      teamLeader: data.teamLeader || null,
      coders: Array.isArray(data.coders) ? data.coders : [],
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    clans.push(newClan);
    writeJSON(FILE, clans);
    return newClan;
  },

  update(id, data) {
    const clans = readJSON(FILE);
    const index = clans.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const current = clans[index];
    const updated = {
      ...current,
      ...data,
      name: data.name !== undefined ? data.name.trim() : current.name,
      description: data.description !== undefined ? data.description.trim() : current.description,
      updatedAt: new Date().toISOString(),
    };

    clans[index] = updated;
    writeJSON(FILE, clans);
    return updated;
  },

  remove(id) {
    const clans = readJSON(FILE);
    const index = clans.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const [deleted] = clans.splice(index, 1);
    writeJSON(FILE, clans);
    return deleted;
  },
};

export default ClanModel;
