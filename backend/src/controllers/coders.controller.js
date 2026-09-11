import * as codersService from '../services/coders.service.js';

// Retorna la lista de todos los programadores
export const getAll = async (req, res) => {
  try {
    const coders = await codersService.getAll();
    res.status(200).json({ ok: true, data: coders });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Retorna un programador específico por ID
export const getById = async (req, res) => {
  try {
    const coder = await codersService.getById(req.params.id);
    if (!coder) {
      return res.status(404).json({ ok: false, message: 'Coder not found' });
    }
    res.status(200).json({ ok: true, data: coder });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Registra un nuevo programador con validaciones de email y asignación de clan
export const create = async (req, res) => {
  try {
    const coder = await codersService.create(req.body);
    res.status(201).json({ ok: true, data: coder });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// Actualiza los datos o membresía de clan de un programador
export const update = async (req, res) => {
  try {
    const coder = await codersService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: coder });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// Elimina a un programador y desvincula sus referencias en el clan
export const remove = async (req, res) => {
  try {
    await codersService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};
