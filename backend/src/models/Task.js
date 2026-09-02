import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from './db.js';

const FILE = 'tasks.json';

const TaskModel = {
  getAll() {
    return readJSON(FILE).filter((t) => !t.deleted);
  },

  getDeleted() {
    return readJSON(FILE).filter((t) => t.deleted);
  },

  getById(id) {
    if (!id) return null;
    const tasks = readJSON(FILE);
    return tasks.find((t) => t.id === id) || null;
  },

  getByAssignee(assigneeId) {
    if (!assigneeId) return [];
    return readJSON(FILE).filter((t) => t.assigneeId === assigneeId && !t.deleted);
  },

  getByClan(clanId) {
    if (!clanId) return [];
    return readJSON(FILE).filter((t) => t.clanId === clanId && !t.deleted);
  },

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
      deleted: Boolean(data.deleted) || false,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };
    tasks.push(newTask);
    writeJSON(FILE, tasks);
    return newTask;
  },

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
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;
    writeJSON(FILE, tasks);
    return updated;
  },

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
