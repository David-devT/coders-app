import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'tasks.json';

const TaskModel = {
  // Retorna todas las tareas activas (no eliminadas)
  getAll() {
    return readJSON(FILE).filter((t) => !t.deleted);
  },

  // Retorna las tareas marcadas como eliminadas (papelera)
  getDeleted() {
    return readJSON(FILE).filter((t) => t.deleted);
  },

  // Busca una tarea por su ID
  getById(id) {
    if (!id) return null;
    const tasks = readJSON(FILE);
    return tasks.find((t) => t.id === id) || null;
  },

  // Busca tareas asignadas a un usuario específico
  getByAssignee(assigneeId) {
    if (!assigneeId) return [];
    return readJSON(FILE).filter((t) => t.assigneeId === assigneeId && !t.deleted);
  },

  // Busca tareas pertenecientes a un clan
  getByClan(clanId) {
    if (!clanId) return [];
    return readJSON(FILE).filter((t) => t.clanId === clanId && !t.deleted);
  },

  // Registra una nueva tarea técnica en disco
  create(data) {
    const tasks = readJSON(FILE);
    const now = new Date().toISOString();
    const newTask = {
      id: data.id || uuidv4(),
      title: data.title?.trim(),
      description: data.description?.trim() || '',
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId || null,
      clanId: data.clanId || null,
      dueDate: data.dueDate || null,
      feedback: data.feedback || null,
      githubUrl: data.githubUrl?.trim() || null,
      history: Array.isArray(data.history) ? data.history : [],
      deleted: Boolean(data.deleted) || false,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    tasks.push(newTask);
    writeJSON(FILE, tasks);
    return newTask;
  },

  // Actualiza los campos de una tarea existente
  update(id, data) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = tasks[index];
    const updated = {
      ...current,
      ...data,
      title: data.title !== undefined ? data.title.trim() : current.title,
      description: data.description !== undefined ? data.description.trim() : current.description,
      dueDate: data.dueDate !== undefined ? data.dueDate : current.dueDate || null,
      feedback: data.feedback !== undefined ? data.feedback : current.feedback || null,
      githubUrl: data.githubUrl !== undefined ? (data.githubUrl ? data.githubUrl.trim() : null) : current.githubUrl || null,
      history: Array.isArray(data.history) ? data.history : current.history || [],
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;
    writeJSON(FILE, tasks);
    return updated;
  },

  // Agrega una entrada al historial de cambios de la tarea
  addHistoryEntry(id, entry) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const history = Array.isArray(tasks[index].history) ? tasks[index].history : [];
    const newEntry = {
      id: uuidv4(),
      status: entry.status,
      changedBy: entry.changedBy || { id: null, name: 'Sistema', role: 'system' },
      feedback: entry.feedback || null,
      timestamp: new Date().toISOString(),
    };

    history.push(newEntry);
    tasks[index].history = history;
    tasks[index].updatedAt = new Date().toISOString();
    writeJSON(FILE, tasks);
    return tasks[index];
  },

  // Marca una tarea como eliminada lógicamente (soft delete)
  remove(id) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      deleted: true,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(FILE, tasks);
    return tasks[index];
  },

  // Restaura una tarea eliminada devolviéndola al estado activo
  restore(id) {
    const tasks = readJSON(FILE);
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    if (!tasks[index].deleted) return null;

    tasks[index] = {
      ...tasks[index],
      deleted: false,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(FILE, tasks);
    return tasks[index];
  },
};

export default TaskModel;
