import * as codersService from '../services/coders.service.js';

// GET /coders - Obtener todos los coders
export const getAll = async (req, res) => {
  try {
    const coders = await codersService.getAll();
    res.status(200).json({ ok: true, data: coders });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /coders/:id - Obtener un coder por ID
export const getById = async (req, res) => {
  try {
    const coder = await codersService.getById(req.params.id);
    if (!coder) return res.status(404).json({ ok: false, message: 'Coder not found' });
    res.status(200).json({ ok: true, data: coder });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /coders - Crear un nuevo coder (requiere rol teamLeader o admin)
export const create = async (req, res) => {
  try {
    const coder = await codersService.create(req.body);
    res.status(201).json({ ok: true, data: coder });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// PUT /coders/:id - Actualizar un coder existente
export const update = async (req, res) => {
  try {
    const coder = await codersService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: coder });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// DELETE /coders/:id - Eliminar un coder y limpiar referencias en clans
export const remove = async (req, res) => {
  try {
    await codersService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};
