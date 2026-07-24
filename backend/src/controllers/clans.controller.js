import * as clansService from '../services/clans.service.js';

// GET /clans - Obtener todos los clans
export const getAll = async (req, res) => {
  try {
    const clans = await clansService.getAll();
    res.status(200).json({ ok: true, data: clans });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /clans/:id - Obtener un clan por ID
export const getById = async (req, res) => {
  try {
    const clan = await clansService.getById(req.params.id);
    if (!clan) return res.status(404).json({ ok: false, message: 'Clan not found' });
    res.status(200).json({ ok: true, data: clan });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /clans - Crear un nuevo clan
export const create = async (req, res) => {
  try {
    const clan = await clansService.create(req.body);
    res.status(201).json({ ok: true, data: clan });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// PUT /clans/:id - Actualizar un clan existente
export const update = async (req, res) => {
  try {
    const clan = await clansService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: clan });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// DELETE /clans/:id - Eliminar un clan y desasociar sus coders
export const remove = async (req, res) => {
  try {
    await clansService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
