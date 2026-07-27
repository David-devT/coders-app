import ClanModel from '../models/Clan.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import CoderModel from '../models/Coder.js';

// Campos permitidos para crear/actualizar un clan (previene inyección de campos extra)
const ALLOWED_CREATE = ['name', 'description', 'teamLeader', 'coders'];
const ALLOWED_UPDATE = ['name', 'description', 'teamLeader', 'coders'];

// Filtra un objeto dejando solo las claves permitidas
function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

// Enriquece un clan sustituyendo IDs de teamLeader y coders por objetos con datos resumidos
function enrich(clan) {
  const result = { ...clan };
  if (result.teamLeader) {
    const tl = TeamLeaderModel.getById(result.teamLeader);
    result.teamLeader = tl ? { id: tl.id, name: tl.name, email: tl.email } : null;
  }
  if (result.coders?.length) {
    result.coders = result.coders
      .map((cId) => {
        const c = CoderModel.getById(cId);
        return c ? { id: c.id, name: c.name, email: c.email } : null;
      })
      .filter(Boolean);
  }
  return result;
}

// Obtener todos los clans con datos enriquecidos
export const getAll = async () => {
  return ClanModel.getAll().map(enrich);
};

// Obtener un clan por ID con datos enriquecidos
export const getById = async (id) => {
  const clan = ClanModel.getById(id);
  return clan ? enrich(clan) : null;
};

// Crear un clan validando unicidad de nombre y límite de 2 clans por team leader
export const create = async ({ name, description, teamLeader }) => {
  const existing = ClanModel.getByName(name);
  if (existing) throw new Error('Clan name already exists');

  // Validar que el team leader no tenga ya 2 o más clans
  if (teamLeader) {
    const allClans = ClanModel.getAll();
    const tlClans = allClans.filter((c) => c.teamLeader === teamLeader);
    if (tlClans.length >= 2) {
      throw new Error('Team Leader can only lead a maximum of 2 clans');
    }
  }

  return ClanModel.create({ name, description, teamLeader });
};

// Actualizar un clan existente; valida límite de 2 clans si se cambia el team leader.
// Solo se permiten campos seguros (whitelist).
export const update = async (id, data) => {
  const safe = pickAllowed(data, ALLOWED_UPDATE);

  if (safe.teamLeader) {
    const allClans = ClanModel.getAll();
    const tlClans = allClans.filter((c) => c.teamLeader === safe.teamLeader && c.id !== id);
    if (tlClans.length >= 2) {
      throw new Error('Team Leader can only lead a maximum of 2 clans');
    }
  }

  const clan = ClanModel.update(id, safe);
  if (!clan) throw new Error('Clan not found');
  return enrich(clan);
};

// Eliminar un clan y desasociar todos los coders que pertenecían a él
export const remove = async (id) => {
  const clan = ClanModel.remove(id);
  if (!clan) throw new Error('Clan not found');

  // Limpiar referencias de clan en todos los coders afectados
  const coders = CoderModel.getAll();
  for (const coder of coders) {
    if (coder.clan === id) {
      CoderModel.update(coder.id, { clan: null });
    }
  }

  return clan;
};
