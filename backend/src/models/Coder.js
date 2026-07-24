import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'coders.json';

// Modelo de datos para Coders: CRUD sobre archivo JSON con IDs UUID v4
const CoderModel = {
  // Obtener todos los coders registrados
  getAll() {
    return readJSON(FILE);
  },

  // Buscar coder por ID único
  getById(id) {
    return readJSON(FILE).find((c) => c.id === id) || null;
  },

  // Buscar coder por email (used para validación de registro duplicado)
  getByEmail(email) {
    return readJSON(FILE).find((c) => c.email === email) || null;
  },

  // Crear un nuevo coder con UUID 自动生成 y timestamps
  create(data) {
    const coders = readJSON(FILE);
    const newCoder = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: data.password,
      clan: data.clan || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    coders.push(newCoder);
    writeJSON(FILE, coders);
    return newCoder;
  },

  // Actualizar campos de un coder existente por ID
  update(id, data) {
    const coders = readJSON(FILE);
    const index = coders.findIndex((c) => c.id === id);
    if (index === -1) return null;
    coders[index] = { ...coders[index], ...data, updatedAt: new Date().toISOString() };
    writeJSON(FILE, coders);
    return coders[index];
  },

  // Eliminar un coder del array por ID
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
