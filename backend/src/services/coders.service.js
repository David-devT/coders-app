import bcrypt from 'bcryptjs';
import CoderModel from '../models/Coder.js';
import ClanModel from '../models/Clan.js';

// Campos permitidos para crear/actualizar un coder (previene inyección de campos extra)
const ALLOWED_CREATE = ['name', 'email', 'password', 'clan'];
const ALLOWED_UPDATE = ['name', 'email', 'password', 'clan'];

// Filtra un objeto dejando solo las claves permitidas
function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

// Elimina password del objeto antes de enviar al cliente
function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

// Sustituye el ID del clan por un objeto con id y name
function enrich(coder) {
  const s = sanitize(coder);
  if (s.clan) {
    const clan = ClanModel.getById(s.clan);
    s.clan = clan ? { id: clan.id, name: clan.name } : null;
  }
  return s;
}

// Obtener todos los coders con datos enriquecidos
export const getAll = async () => {
  return CoderModel.getAll().map(enrich);
};

// Obtener un coder por ID con datos enriquecidos
export const getById = async (id) => {
  const coder = CoderModel.getById(id);
  return coder ? enrich(coder) : null;
};

// Crear coder: valida email duplicado, hashea contraseña y persiste
export const create = async ({ name, email, password, clan }) => {
  const existing = CoderModel.getByEmail(email);
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const coder = CoderModel.create({ name, email, password: hashedPassword, clan });
  return enrich(coder);
};

// Actualizar coder: hashea nueva contraseña si se proporciona, o la omite.
// Solo se permiten campos seguros (whitelist).
export const update = async (id, data) => {
  const safe = pickAllowed(data, ALLOWED_UPDATE);

  if (safe.password) {
    safe.password = await bcrypt.hash(safe.password, 10);
  } else {
    delete safe.password;
  }

  const coder = CoderModel.update(id, safe);
  if (!coder) throw new Error('Coder not found');
  return enrich(coder);
};

// Eliminar coder y limpiar referencias en todos los clans que lo contienen
export const remove = async (id) => {
  const coder = CoderModel.remove(id);
  if (!coder) throw new Error('Coder not found');

  // Desasociar el coder eliminado de todos los clans
  const clans = ClanModel.getAll();
  for (const clan of clans) {
    if (clan.coders.includes(id)) {
      ClanModel.update(clan.id, {
        coders: clan.coders.filter((cId) => cId !== id),
      });
    }
  }

  return coder;
};
