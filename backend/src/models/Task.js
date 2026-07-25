import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'tasks.json';

// Modelo de datos para Tasks: CRUD sobre archivo JSON con IDs UUID v4
const TaskModel = {
  // Obtener todas las tareas
  getAll() {
    return readJSON(FILE);
  },

  // Buscar una tarea por su ID único
  getById(id) {
    return readJSON(FILE).find((t) => t.id === id) || null;
  },

  // Obtener tareas por assigneeId (para que un coder vea solo las suyas)
  getByAssignee(assigneeId) {
    return readJSON(FILE).filter((t) => t.assigneeId === assigneeId);
  },

  // Obtener tareas por clanId (para que un team leader vea las de su clan)
  getByClan(clanId) {
    return readJSON(FILE).filter((t) => t.clanId === clanId);
  },

  // Crear una nueva tarea con UUID 自动生成, timestamps y estado por defecto
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

  // Eliminar una tarea por ID del array y persistir el cambio
  remove(id) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const [deleted] = tasks.splice(index, 1);
    writeJSON(FILE, tasks);
    return deleted;
  },
};

export default TaskModel;
