import * as tasksService from '../services/tasks.service.js';

// GET /tasks - Obtener tareas filtradas por rol del usuario
export const getAll = async (req, res) => {
  try {
    const tasks = await tasksService.getByRole(req.user.id, req.user.role);
    res.status(200).json({ ok: true, data: tasks });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /tasks/:id - Obtener una tarea por ID
export const getById = async (req, res) => {
  try {
    const task = await tasksService.getById(req.params.id);
    if (!task) return res.status(404).json({ ok: false, message: 'Task not found' });
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /tasks - Crear una nueva tarea
export const create = async (req, res) => {
  try {
    const task = await tasksService.create(req.body);
    res.status(201).json({ ok: true, data: task });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// PATCH /tasks/:id/status - Cambiar estado de una tarea
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await tasksService.updateStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role
    );
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// PUT /tasks/:id - Actualizar una tarea
export const update = async (req, res) => {
  try {
    const task = await tasksService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// DELETE /tasks/:id - Eliminar una tarea (soft delete, solo admin)
export const remove = async (req, res) => {
  try {
    await tasksService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// GET /tasks/deleted - Obtener tareas eliminadas (solo admin)
export const getDeleted = async (req, res) => {
  try {
    const tasks = await tasksService.getDeleted();
    res.status(200).json({ ok: true, data: tasks });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /tasks/:id/restore - Restaurar una tarea eliminada (solo admin)
export const restore = async (req, res) => {
  try {
    const task = await tasksService.restore(req.params.id);
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
