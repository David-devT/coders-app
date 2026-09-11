import { v4 as uuidv4 } from 'uuid';
import TaskModel from '../models/Task.js';
import CoderModel from '../models/Coder.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import ClanModel from '../models/Clan.js';
import {
  notifyTaskSubmittedForReview,
  notifyTaskDecision,
} from './notifications.service.js';

// Campos editables permitidos en una tarea
const ALLOWED_UPDATE = ['title', 'description', 'priority', 'assigneeId', 'clanId', 'dueDate', 'feedback', 'githubUrl'];

// Orden numérico para ordenar tareas según prioridad
const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

// Filtra las propiedades permitidas para actualización
function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

// Busca a un usuario asignado ya sea en Coders o en Team Leaders
function findUser(userId) {
  if (!userId) return null;
  const coder = CoderModel.getById(userId);
  if (coder) {
    return { id: coder.id, name: coder.name, email: coder.email, role: 'coder' };
  }

  const tl = TeamLeaderModel.getById(userId);
  if (tl) {
    return { id: tl.id, name: tl.name, email: tl.email, role: tl.role };
  }

  return null;
}

// Enriquece el objeto de tarea resolviendo asignado y clan correspondiente
function enrich(task) {
  if (!task) return null;
  const result = { ...task };

  if (result.assigneeId) {
    const user = findUser(result.assigneeId);
    result.assignee = user ? { id: user.id, name: user.name, email: user.email } : null;
  } else {
    result.assignee = null;
  }

  if (result.clanId) {
    const clan = ClanModel.getById(result.clanId);
    result.clan = clan ? { id: clan.id, name: clan.name } : null;
  } else {
    result.clan = null;
  }

  delete result.assigneeId;
  delete result.clanId;
  return result;
}

// Ordena la lista de tareas de mayor a menor prioridad
function sortByPriority(tasks) {
  return tasks.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1));
}

// Obtiene todas las tareas activas ordenadas por prioridad
export const getAll = async () => {
  const tasks = TaskModel.getAll();
  const enriched = tasks.map(enrich);
  return sortByPriority(enriched);
};

// Filtra las tareas según el rol y permisos: admin ve todo, TL ve sus clanes, coder ve las suyas
export const getByRole = async (userId, role) => {
  let tasks;

  if (role === 'admin') {
    tasks = TaskModel.getAll();
  } else if (role === 'teamLeader') {
    const allClans = ClanModel.getAll();
    const ledClans = allClans.filter((c) => c.teamLeader === userId);
    const ledClanIds = ledClans.map((c) => c.id);
    const allTasks = TaskModel.getAll();
    tasks = allTasks.filter(
      (t) => (t.clanId && ledClanIds.includes(t.clanId)) || t.assigneeId === userId
    );
  } else {
    tasks = TaskModel.getByAssignee(userId);
  }

  const enriched = tasks.map(enrich);
  return sortByPriority(enriched);
};

// Obtiene una tarea activa por su identificador
export const getById = async (id) => {
  const task = TaskModel.getById(id);
  return task ? enrich(task) : null;
};

// Registra una nueva tarea con estado inicial 'pending', fecha límite opcional, enlace GitHub e historial inicial
export const create = async ({ title, description, priority, assigneeId, clanId, dueDate, feedback, githubUrl, creator }) => {
  if (!title || !title.trim()) throw new Error('Task title is required');

  let validAssigneeId = null;
  if (assigneeId) {
    const user = findUser(assigneeId);
    if (!user) throw new Error('Assignee not found');
    validAssigneeId = user.id;
  }

  let validClanId = null;
  if (clanId) {
    const clan = ClanModel.getById(clanId);
    if (!clan) throw new Error('Clan not found');
    validClanId = clan.id;
  }

  // Registro de entrada inicial en el historial de la tarea
  const initialHistory = [
    {
      id: uuidv4(),
      status: 'pending',
      changedBy: creator
        ? { id: creator.id, name: creator.name, role: creator.role }
        : { id: null, name: 'Sistema', role: 'system' },
      feedback: 'Creación de la tarea técnica',
      timestamp: new Date().toISOString(),
    },
  ];

  const task = TaskModel.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    assigneeId: validAssigneeId,
    clanId: validClanId,
    dueDate: dueDate ? String(dueDate).trim() : null,
    feedback: feedback ? String(feedback).trim() : null,
    githubUrl: githubUrl ? String(githubUrl).trim() : null,
    history: initialHistory,
    status: 'pending',
    deleted: false,
  });

  return enrich(task);
};

// Matriz estricta de transiciones permitidas del tablero Kanban
const VALID_TRANSITIONS = {
  pending: ['review'],
  review: ['approved', 'rejected'],
  rejected: ['pending'],
  approved: [],
};

// Valida y ejecuta la transición de estado Kanban aplicando reglas de rol, notas de feedback, historial y notificaciones
export const updateStatus = async (id, status, userId, role, feedback = undefined) => {
  const task = TaskModel.getById(id);
  if (!task || task.deleted) throw new Error('Task not found');

  const allowedNext = VALID_TRANSITIONS[task.status];
  if (!allowedNext || !allowedNext.includes(status)) {
    throw new Error(`Cannot transition from '${task.status}' to '${status}'`);
  }

  // De pending a review: solo el asignado o admin
  if (status === 'review') {
    if (task.assigneeId !== userId && role !== 'admin') {
      throw new Error('Only the assignee can mark a task for review');
    }
  }

  // De review a approved o rejected: solo TL o Admin (TL de su clan)
  if (status === 'approved' || status === 'rejected') {
    if (role === 'coder') {
      throw new Error('Only team leaders or admins can approve/reject tasks');
    }
    if (role === 'teamLeader') {
      const allClans = ClanModel.getAll();
      const ledClans = allClans.filter((c) => c.teamLeader === userId);
      const ledClanIds = ledClans.map((c) => c.id);
      if (!task.clanId || !ledClanIds.includes(task.clanId)) {
        throw new Error('Task does not belong to your clan');
      }
    }
  }

  // De rejected a pending (reabrir tarea): solo TL o Admin
  if (status === 'pending' && task.status === 'rejected') {
    if (role === 'coder') {
      throw new Error('Only team leaders or admins can reopen rejected tasks');
    }
  }

  const updateData = { status };
  if (feedback !== undefined) {
    updateData.feedback = feedback ? String(feedback).trim() : null;
  }

  const updated = TaskModel.update(id, updateData);

  // Resuelve información del actor de la acción
  const actor = findUser(userId) || { id: userId, name: 'Usuario', role };

  // Registra la entrada en el historial de trazabilidad
  TaskModel.addHistoryEntry(id, {
    status,
    changedBy: { id: actor.id, name: actor.name, role },
    feedback: feedback || null,
  });

  // Emite notificaciones internas según el estado resultante
  if (status === 'review') {
    notifyTaskSubmittedForReview(updated, actor);
  } else if (status === 'approved' || status === 'rejected') {
    notifyTaskDecision(updated, status, actor, feedback);
  }

  return enrich(TaskModel.getById(id));
};

// Modifica los campos editables de una tarea existente
export const update = async (id, data) => {
  const current = TaskModel.getById(id);
  if (!current || current.deleted) throw new Error('Task not found');

  const safe = pickAllowed(data, ALLOWED_UPDATE);

  if (safe.assigneeId) {
    const user = findUser(safe.assigneeId);
    if (!user) throw new Error('Assignee not found');
  }

  if (safe.clanId) {
    const clan = ClanModel.getById(safe.clanId);
    if (!clan) throw new Error('Clan not found');
  }

  if (safe.priority && !['low', 'medium', 'high'].includes(safe.priority)) {
    delete safe.priority;
  }

  const updated = TaskModel.update(id, safe);
  return enrich(updated);
};

// Realiza soft delete marcando la tarea como deleted=true
export const remove = async (id) => {
  const task = TaskModel.getById(id);
  if (!task || task.deleted) throw new Error('Task not found');

  const deleted = TaskModel.remove(id);
  return deleted;
};

// Retorna las tareas en la papelera de reciclaje ordenadas por prioridad
export const getDeleted = async () => {
  const deletedTasks = TaskModel.getDeleted();
  const enriched = deletedTasks.map(enrich);
  return sortByPriority(enriched);
};

// Restaura una tarea eliminada de la papelera devolviéndola al estado activo
export const restore = async (id) => {
  const task = TaskModel.getById(id);
  if (!task || !task.deleted) throw new Error('Deleted task not found');

  const restored = TaskModel.restore(id);
  return enrich(restored);
};
