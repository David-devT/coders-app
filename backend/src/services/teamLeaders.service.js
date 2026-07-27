import bcrypt from 'bcryptjs';
import TeamLeaderModel from '../models/TeamLeader.js';
import CoderModel from '../models/Coder.js';
import ClanModel from '../models/Clan.js';

// Campos permitidos para crear/actualizar un team leader (previene inyección de campos extra)
const ALLOWED_UPDATE = ['name', 'email', 'password'];

// Filtra un objeto dejando solo las claves permitidas
function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

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

// Actualizar team leader: hashea nueva contraseña si se proporciona, o la omite.
// Solo se permiten campos seguros (whitelist).
export const update = async (id, data) => {
  const safe = pickAllowed(data, ALLOWED_UPDATE);

  if (safe.password) {
    safe.password = await bcrypt.hash(safe.password, 10);
  } else {
    delete safe.password;
  }

  const tl = TeamLeaderModel.update(id, safe);
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

// Promover un coder a team leader: crea un TL con los datos del coder y elimina el coder
export const promote = async (coderId) => {
  const coder = CoderModel.getById(coderId);
  if (!coder) throw new Error('Coder not found');

  // Verificar que el email no esté ya registrado como team leader
  const existing = TeamLeaderModel.getByEmail(coder.email);
  if (existing) throw new Error('Email already registered as team leader');

  // Crear team leader con los datos del coder (se preserva la contraseña hasheada)
  const tl = TeamLeaderModel.create({
    name: coder.name,
    email: coder.email,
    password: coder.password,
    role: 'teamLeader',
  });

  // Eliminar el coder promovido
  CoderModel.remove(coderId);

  // Desasociar al coder de su clan si tenía uno
  if (coder.clan) {
    const clan = ClanModel.getById(coder.clan);
    if (clan && clan.coders?.length) {
      ClanModel.update(clan.id, {
        coders: clan.coders.filter((cId) => cId !== coderId),
      });
    }
  }

  return enrich(tl);
};

// Degradar un team leader a coder: crea un coder con los datos del TL y elimina el TL
export const demote = async (tlId) => {
  const tl = TeamLeaderModel.getById(tlId);
  if (!tl) throw new Error('Team Leader not found');

  // No permitir degradar a un admin
  if (tl.role === 'admin') throw new Error('Cannot demote an admin');

  // Verificar que el email no esté ya registrado como coder
  const existing = CoderModel.getByEmail(tl.email);
  if (existing) throw new Error('Email already registered as coder');

  // Crear coder con los datos del team leader (se preserva la contraseña hasheada)
  const coder = CoderModel.create({
    name: tl.name,
    email: tl.email,
    password: tl.password,
    clan: null,
  });

  // Desasociar al team leader de todos sus clans antes de eliminarlo
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.teamLeader === tlId) {
      ClanModel.update(clan.id, { teamLeader: null });
    }
  }

  // Eliminar el team leader
  TeamLeaderModel.remove(tlId);

  return sanitize(coder);
};
