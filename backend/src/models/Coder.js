import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'coders.json';

const CoderModel = {
  getAll() {
    return readJSON(FILE);
  },

  getById(id) {
    if (!id) return null;
    const coders = readJSON(FILE);
    return coders.find((c) => c.id === id) || null;
  },

  getByEmail(email) {
    if (!email) return null;
    const coders = readJSON(FILE);
    const normalized = email.trim().toLowerCase();
    return coders.find((c) => c.email && c.email.toLowerCase() === normalized) || null;
  },

  create(data) {
    const coders = readJSON(FILE);
    const now = new Date().toISOString();
    const newCoder = {
      id: data.id || uuidv4(),
      name: data.name?.trim(),
      email: data.email?.trim().toLowerCase(),
      password: data.password,
      clan: data.clan || null,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    coders.push(newCoder);
    writeJSON(FILE, coders);
    return newCoder;
  },

  update(id, data) {
    const coders = readJSON(FILE);
    const index = coders.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const current = coders[index];
    const updated = {
      ...current,
      ...data,
      email: data.email !== undefined ? data.email.trim().toLowerCase() : current.email,
      name: data.name !== undefined ? data.name.trim() : current.name,
      updatedAt: new Date().toISOString(),
    };

    coders[index] = updated;
    writeJSON(FILE, coders);
    return updated;
  },

  remove(id) {
    const coders = readJSON(FILE);
    const index = coders.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const [deleted] = coders.splice(index, 1);
    writeJSON(FILE, coders);
    return deleted;
  },
};

export default CoderModel;
