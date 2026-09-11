import * as teamLeadersService from '../services/teamLeaders.service.js';

// Retorna todos los líderes de equipo registrados
export const getAll = async (req, res) => {
  try {
    const teamLeaders = await teamLeadersService.getAll();
    res.status(200).json({ ok: true, data: teamLeaders });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Retorna un líder de equipo por ID
export const getById = async (req, res) => {
  try {
    const tl = await teamLeadersService.getById(req.params.id);
    if (!tl) {
      return res.status(404).json({ ok: false, message: 'Team Leader not found' });
    }
    res.status(200).json({ ok: true, data: tl });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// Crea un nuevo líder de equipo con credenciales cifradas
export const create = async (req, res) => {
  try {
    const tl = await teamLeadersService.create(req.body);
    res.status(201).json({ ok: true, data: tl });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// Actualiza la información o rol de un líder de equipo
export const update = async (req, res) => {
  try {
    const tl = await teamLeadersService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: tl });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// Elimina un líder de equipo y desvincula sus clanes dirigidos
export const remove = async (req, res) => {
  try {
    await teamLeadersService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// Promueve a un Coder existente al rol de Team Leader
export const promote = async (req, res) => {
  try {
    const { coderId } = req.body;
    const tl = await teamLeadersService.promote(coderId);
    res.status(201).json({ ok: true, data: tl });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// Degrada a un Team Leader al rol de Coder regular
export const demote = async (req, res) => {
  try {
    const { tlId } = req.body;
    const coder = await teamLeadersService.demote(tlId);
    res.status(200).json({ ok: true, data: coder });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
