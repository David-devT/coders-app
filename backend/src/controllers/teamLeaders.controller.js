import * as teamLeadersService from '../services/teamLeaders.service.js';

// GET /team-leaders - Obtener todos los team leaders (solo admin)
export const getAll = async (req, res) => {
  try {
    const teamLeaders = await teamLeadersService.getAll();
    res.status(200).json({ ok: true, data: teamLeaders });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// GET /team-leaders/:id - Obtener un team leader por ID (solo admin)
export const getById = async (req, res) => {
  try {
    const tl = await teamLeadersService.getById(req.params.id);
    if (!tl) return res.status(404).json({ ok: false, message: 'Team Leader not found' });
    res.status(200).json({ ok: true, data: tl });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// POST /team-leaders - Crear un nuevo team leader (solo admin)
export const create = async (req, res) => {
  try {
    const tl = await teamLeadersService.create(req.body);
    res.status(201).json({ ok: true, data: tl });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// PUT /team-leaders/:id - Actualizar un team leader existente (solo admin)
export const update = async (req, res) => {
  try {
    const tl = await teamLeadersService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: tl });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// DELETE /team-leaders/:id - Eliminar un team leader y desasociar de sus clans (solo admin)
export const remove = async (req, res) => {
  try {
    await teamLeadersService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// POST /team-leaders/promote - Promover un coder a team leader (solo admin)
export const promote = async (req, res) => {
  try {
    const tl = await teamLeadersService.promote(req.body.coderId);
    res.status(201).json({ ok: true, data: tl });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// POST /team-leaders/demote - Degradar un team leader a coder (solo admin)
export const demote = async (req, res) => {
  try {
    const coder = await teamLeadersService.demote(req.body.tlId);
    res.status(200).json({ ok: true, data: coder });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
