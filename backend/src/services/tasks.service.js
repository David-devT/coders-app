import TaskModel from '../models/Task.js';
import CoderModel from '../models/Coder.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import ClanModel from '../models/Clan.js';

const ALLOWED_UPDATE = ['title', 'description', 'priority', 'assigneeId', 'clanId'];

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

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

function sortByPriority(tasks) {
  return tasks.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1));
}

export const getAll = async () => {
  const tasks = TaskModel.getAll();
  const enriched = tasks.map(enrich);
  return sortByPriority(enriched);
};

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

export const getById = async (id) => {
  const task = TaskModel.getById(id);
  return task ? enrich(task) : null;
};

export const create = async ({ title, description, priority, assigneeId, clanId }) => {
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

  const task = TaskModel.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    assigneeId: validAssigneeId,
    clanId: validClanId,
    status: 'pending',
    deleted: false,
  });

  return enrich(task);
};

const VALID_TRANSITIONS = {
  pending: ['review'],
  review: ['approved', 'rejected'],
  rejected: ['pending'],
  approved: [],
};

export const updateStatus = async (id, status, userId, role) => {
  const task = TaskModel.getById(id);
  if (!task || task.deleted) throw new Error('Task not found');

  const allowedNext = VALID_TRANSITIONS[task.status];
  if (!allowedNext || !allowedNext.includes(status)) {
    throw new Error(`Cannot transition from '${task.status}' to '${status}'`);
  }

  // Permission: pending -> review
  if (status === 'review') {
    if (task.assigneeId !== userId && role !== 'admin') {
      throw new Error('Only the assignee can mark a task for review');
    }
  }

  // Permission: review -> approved / rejected
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

  // Permission: rejected -> pending (reopen)
  if (status === 'pending' && task.status === 'rejected') {
    if (role === 'coder') {
      throw new Error('Only team leaders or admins can reopen rejected tasks');
    }
  }

  const updated = TaskModel.update(id, { status });
  return enrich(updated);
};

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

export const remove = async (id) => {
  const task = TaskModel.getById(id);
  if (!task || task.deleted) throw new Error('Task not found');

  const deleted = TaskModel.remove(id);
  return deleted;
};

export const getDeleted = async () => {
  const deletedTasks = TaskModel.getDeleted();
  const enriched = deletedTasks.map(enrich);
  return sortByPriority(enriched);
};

export const restore = async (id) => {
  const task = TaskModel.getById(id);
  if (!task || !task.deleted) throw new Error('Deleted task not found');

  const restored = TaskModel.restore(id);
  return enrich(restored);
};
