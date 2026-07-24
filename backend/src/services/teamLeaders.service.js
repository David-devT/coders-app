import bcrypt from 'bcryptjs';
import TeamLeaderModel from '../models/TeamLeader.js';
import ClanModel from '../models/Clan.js';

// Elimina password del objeto antes de retornar al cliente
function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

// Enriquece team leader con lista de clans que lidera (id y name)
function enrich(tl) {
  const s = sanitize(tl);
  s.clans = ClanModel.getAll()
    .filter((c) => c.teamLeader === s.id)
    .map((c) => ({ id: c.id, name: c.name }));
  return s;
}

// Obtener todos los team leaders con datos enriquecidos
export const getAll = async () => {
  return TeamLeaderModel.getAll().map(enrich);
};

// Obtener un team leader por ID con datos enriquecidos
export const getById = async (id) => {
  const tl = TeamLeaderModel.getById(id);
  return tl ? enrich(tl) : null;
};

// Crear team leader: valida email duplicado, hashea contraseña y persiste
export const create = async ({ name, email, password, role }) => {
  const existing = TeamLeaderModel.getByEmail(email);
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const tl = TeamLeaderModel.create({ name, email, password: hashedPassword, role });
  return enrich(tl);
};

// Actualizar team leader: hashea nueva contraseña si se proporciona, o la omite
export const update = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  } else {
    // Evitar sobrescribir el hash existente con undefined
    delete data.password;
  }

  const tl = TeamLeaderModel.update(id, data);
  if (!tl) throw new Error('Team Leader not found');
  return enrich(tl);
};

// Eliminar team leader y desasociar de todos los clans que lideraba
export const remove = async (id) => {
  const tl = TeamLeaderModel.remove(id);
  if (!tl) throw new Error('Team Leader not found');

  // Quitar la referencia del team leader eliminado de sus clans asignados
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.teamLeader === id) {
      ClanModel.update(clan.id, { teamLeader: null });
    }
  }

  return tl;
};
