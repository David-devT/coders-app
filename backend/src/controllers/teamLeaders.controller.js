import * as teamLeadersService from '../services/teamLeaders.service.js';

export const getAll = async (req, res) => {
  try {
    const teamLeaders = await teamLeadersService.getAll();
    res.status(200).json({ ok: true, data: teamLeaders });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

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

export const create = async (req, res) => {
  try {
    const tl = await teamLeadersService.create(req.body);
    res.status(201).json({ ok: true, data: tl });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const tl = await teamLeadersService.update(req.params.id, req.body);
    res.status(200).json({ ok: true, data: tl });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await teamLeadersService.remove(req.params.id);
    res.status(200).json({ ok: true, data: null });
  } catch (error) {
    const status = error.message.toLowerCase().includes('not found') ? 404 : 400;
    res.status(status).json({ ok: false, message: error.message });
  }
};

export const promote = async (req, res) => {
  try {
    const { coderId } = req.body;
    const tl = await teamLeadersService.promote(coderId);
    res.status(201).json({ ok: true, data: tl });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

export const demote = async (req, res) => {
  try {
    const { tlId } = req.body;
    const coder = await teamLeadersService.demote(tlId);
    res.status(200).json({ ok: true, data: coder });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};
