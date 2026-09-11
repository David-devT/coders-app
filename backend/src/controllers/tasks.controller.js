import * as tasksService from '../services/tasks.service.js';

// Retorna las tareas visibles según el rol del usuario autenticado
export const getAll = async (req, res) => {
  try {
    const tasks = await tasksService.getByRole(req.user.id, req.user.role);
    res.status(200).json({ ok: true, data: tasks });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Retorna una tarea específica por su ID
export const getById = async (req, res) => {
  try {
    const task = await tasksService.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ ok: false, message: 'Task not found' });
    }
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Crea una nueva tarea técnica y la sitúa en estado pendiente con autoría
export const create = async (req, res) => {
  try {
    const task = await tasksService.create({ ...req.body, creator: req.user });
    res.status(201).json({ ok: true, data: task });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// Actualiza el estado Kanban aplicando validación de transiciones y permisos
export const updateStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const task = await tasksService.updateStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role,
      feedback
    );
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// Modifica las propiedades descriptivas de una tarea
export const update = async (req, res) => {
  try {
    const task = await tasksService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// Realiza la eliminación lógica (soft delete) de una tarea
export const remove = async (req, res) => {
  try {
    await tasksService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// Retorna las tareas que se encuentran en la papelera de reciclaje
export const getDeleted = async (req, res) => {
  try {
    const tasks = await tasksService.getDeleted();
    res.status(200).json({ ok: true, data: tasks });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Restaura una tarea eliminada devolviéndola al estado activo
export const restore = async (req, res) => {
  try {
    const task = await tasksService.restore(req.params.id);
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};
