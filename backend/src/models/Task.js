import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'tasks.json';

// Modelo de datos para Tasks: CRUD sobre archivo JSON con IDs UUID v4.
// Soporta soft delete mediante el campo `deleted` (default false).
// Las tareas eliminadas no se borran del archivo, solo se marcan como deleted: true.
const TaskModel = {
  // Obtener todas las tareas activas (excluye las marcadas como deleted)
  getAll() {
    return readJSON(FILE).filter((t) => !t.deleted);
  },

  // Obtener todas las tareas eliminadas (solo las marcadas como deleted)
  getDeleted() {
    return readJSON(FILE).filter((t) => t.deleted);
  },

  // Buscar una tarea por su ID único (incluye eliminadas para poder restaurarlas)
  getById(id) {
    return readJSON(FILE).find((t) => t.id === id) || null;
  },

  // Obtener tareas activas por assigneeId (para que un coder vea solo las suyas)
  getByAssignee(assigneeId) {
    return readJSON(FILE).filter((t) => t.assigneeId === assigneeId && !t.deleted);
  },

  // Obtener tareas activas por clanId (para que un team leader vea las de su clan)
  getByClan(clanId) {
    return readJSON(FILE).filter((t) => t.clanId === clanId && !t.deleted);
  },

  // Crear una nueva tarea con UUID, timestamps, estado por defecto y deleted: false
  create(data) {
    const tasks = readJSON(FILE);
    const newTask = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      status: 'pending',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId,
      clanId: data.clanId || null,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    writeJSON(FILE, tasks);
    return newTask;
  },

  // Actualizar una tarea existente por ID, aplicando merge de campos
  update(id, data) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...data, updatedAt: new Date().toISOString() };
    writeJSON(FILE, tasks);
    return tasks[index];
  },

  // Soft delete: marca una tarea como deleted en lugar de borrarla del archivo
  remove(id) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], deleted: true, updatedAt: new Date().toISOString() };
    writeJSON(FILE, tasks);
    return tasks[index];
  },

  // Restaurar una tarea eliminada: marca deleted como false
  restore(id) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    if (!tasks[index].deleted) return null; // No restaurar si no está eliminada
    tasks[index] = { ...tasks[index], deleted: false, updatedAt: new Date().toISOString() };
    writeJSON(FILE, tasks);
    return tasks[index];
  },
};

export default TaskModel;
