import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'clans.json';

// Modelo de datos para Clans: CRUD sobre archivo JSON con IDs UUID v4
const ClanModel = {
  // Obtener todos los registros
  getAll() {
    return readJSON(FILE);
  },

  // Buscar un clan por su ID único
  getById(id) {
    return readJSON(FILE).find((c) => c.id === id) || null;
  },

  // Buscar un clan por nombre (used para validación de duplicados)
  getByName(name) {
    return readJSON(FILE).find((c) => c.name === name) || null;
  },

  // Crear un nuevo clan con UUID 自动生成, timestamps y valores por defecto
  create(data) {
    const clans = readJSON(FILE);
    const newClan = {
      id: uuidv4(),
      name: data.name,
      description: data.description || '',
      teamLeader: data.teamLeader || null,
      coders: data.coders || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clans.push(newClan);
    writeJSON(FILE, clans);
    return newClan;
  },

  // Actualizar un clan existente por ID, aplicando merge de campos
  update(id, data) {
    const clans = readJSON(FILE);
    const index = clans.findIndex((c) => c.id === id);
    if (index === -1) return null;
    clans[index] = { ...clans[index], ...data, updatedAt: new Date().toISOString() };
    writeJSON(FILE, clans);
    return clans[index];
  },

  // Eliminar un clan por ID del array y persistir el cambio
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
