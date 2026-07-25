import TaskModel from '../models/Task.js';
import CoderModel from '../models/Coder.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import ClanModel from '../models/Clan.js';

// Buscar un usuario (coder o teamLeader) por ID
function findUser(userId) {
  let user = CoderModel.getById(userId);
  if (user) return { id: user.id, name: user.name, email: user.email, role: 'coder' };

  user = TeamLeaderModel.getById(userId);
  if (user) return { id: user.id, name: user.name, email: user.email, role: user.role };

  return null;
}

// Enriquece una tarea sustituyendo assigneeId y clanId por objetos con datos resumidos
function enrich(task) {
  const result = { ...task };
  if (result.assigneeId) {
    const user = findUser(result.assigneeId);
    result.assignee = user ? { id: user.id, name: user.name, email: user.email } : null;
  }
  if (result.clanId) {
    const clan = ClanModel.getById(result.clanId);
    result.clan = clan ? { id: clan.id, name: clan.name } : null;
  }
  delete result.assigneeId;
  delete result.clanId;
  return result;
}

// Obtener todas las tareas con datos enriquecidos, ordenadas por prioridad (high > medium > low)
export const getAll = async () => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return TaskModel.getAll()
    .map(enrich)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Obtener tareas filtradas por rol del usuario, ordenadas por prioridad
export const getByRole = async (userId, role) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  let tasks;

  if (role === 'admin') {
    tasks = TaskModel.getAll();
  } else if (role === 'teamLeader') {
    // Team leader ve tareas de los clans que lidera
    const clans = ClanModel.getAll().filter((c) => c.teamLeader === userId);
    const clanIds = clans.map((c) => c.id);
    tasks = TaskModel.getAll().filter(
      (t) => clanIds.includes(t.clanId) || t.assigneeId === userId
    );
  } else {
    // Coder solo ve sus propias tareas
    tasks = TaskModel.getByAssignee(userId);
  }

  return tasks
    .map(enrich)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Obtener una tarea por ID con datos enriquecidos
export const getById = async (id) => {
  const task = TaskModel.getById(id);
  return task ? enrich(task) : null;
};

// Crear una tarea validando que el assignee exista
export const create = async ({ title, description, priority, assigneeId, clanId }) => {
  const assignee = findUser(assigneeId);
  if (!assignee) throw new Error('Assignee not found');

  if (clanId) {
    const clan = ClanModel.getById(clanId);
    if (!clan) throw new Error('Clan not found');
  }

  return TaskModel.create({ title, description, priority, assigneeId, clanId });
};

// Actualizar estado de una tarea con validación de permisos
export const updateStatus = async (id, status, userId, role) => {
  const task = TaskModel.getById(id);
  if (!task) throw new Error('Task not found');

  // Validar transiciones permitidas
  if (status === 'review') {
    // Solo el assignee puede marcar como "en revisión"
    if (task.assigneeId !== userId && role !== 'admin') {
      throw new Error('Only the assignee can mark a task for review');
    }
  }

  if (status === 'approved' || status === 'rejected') {
    // Solo teamLeader o admin pueden aprobar/rechazar
    if (role === 'coder') {
      throw new Error('Only team leaders or admins can approve/reject tasks');
    }
    // Si es teamLeader, verificar que la tarea pertenezca a su clan
    if (role === 'teamLeader') {
      const clans = ClanModel.getAll().filter((c) => c.teamLeader === userId);
      const clanIds = clans.map((c) => c.id);
      if (!clanIds.includes(task.clanId)) {
        throw new Error('Task does not belong to your clan');
      }
    }
  }

  if (status === 'pending' && task.status === 'rejected') {
    // Reabrir tarea: solo teamLeader o admin
    if (role === 'coder') {
      throw new Error('Only team leaders or admins can reopen rejected tasks');
    }
  }

  return enrich(TaskModel.update(id, { status }));
};

// Actualizar una tarea existente; retorna null si no se encuentra
export const update = async (id, data) => {
  const task = TaskModel.update(id, data);
  if (!task) throw new Error('Task not found');
  return enrich(task);
};

// Eliminar una tarea (soft delete: marca como deleted en lugar de borrar)
export const remove = async (id) => {
  const task = TaskModel.remove(id);
  if (!task) throw new Error('Task not found');
  return task;
};

// Obtener todas las tareas eliminadas (solo admin)
export const getDeleted = async () => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return TaskModel.getDeleted()
    .map(enrich)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

// Restaurar una tarea eliminada (marca deleted como false)
export const restore = async (id) => {
  const task = TaskModel.restore(id);
  if (!task) throw new Error('Deleted task not found');
  return enrich(task);
};
