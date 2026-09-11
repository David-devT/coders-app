import * as clansService from '../services/clans.service.js';

// Retorna todos los clanes técnicos existentes
export const getAll = async (req, res) => {
  try {
    const clans = await clansService.getAll();
    res.status(200).json({ ok: true, data: clans });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Retorna los datos de un clan por su identificador
export const getById = async (req, res) => {
  try {
    const clan = await clansService.getById(req.params.id);
    if (!clan) {
      return res.status(404).json({ ok: false, message: 'Clan not found' });
    }
    res.status(200).json({ ok: true, data: clan });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Crea un nuevo clan con su líder de equipo asignado
export const create = async (req, res) => {
  try {
    const clan = await clansService.create(req.body);
    res.status(201).json({ ok: true, data: clan });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// Actualiza el nombre, descripción o líder de un clan
export const update = async (req, res) => {
  try {
    const clan = await clansService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: clan });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// Elimina un clan y reasigna los programadores pertenecientes
export const remove = async (req, res) => {
  try {
    await clansService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};
