import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'teamLeaders.json';

// Modelo de datos para Team Leaders: CRUD sobre archivo JSON con IDs UUID v4
const TeamLeaderModel = {
  // Obtener todos los team leaders registrados
  getAll() {
    return readJSON(FILE);
  },

  // Buscar team leader por ID único
  getById(id) {
    return readJSON(FILE).find((t) => t.id === id) || null;
  },

  // Buscar team leader por email (used para validación de registro duplicado)
  getByEmail(email) {
    return readJSON(FILE).find((t) => t.email === email) || null;
  },

  // Crear un nuevo team leader con rol por defecto 'teamLeader'
  create(data) {
    const teamLeaders = readJSON(FILE);
    const newTL = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'teamLeader',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    teamLeaders.push(newTL);
    writeJSON(FILE, teamLeaders);
    return newTL;
  },

  // Actualizar campos de un team leader existente por ID
  update(id, data) {
    const teamLeaders = readJSON(FILE);
    const index = teamLeaders.findIndex((t) => t.id === id);
    if (index === -1) return null;
    teamLeaders[index] = { ...teamLeaders[index], ...data, updatedAt: new Date().toISOString() };
    writeJSON(FILE, teamLeaders);
    return teamLeaders[index];
  },

  // Eliminar un team leader del array por ID
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
