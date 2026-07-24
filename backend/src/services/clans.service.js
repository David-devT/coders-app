import ClanModel from '../models/Clan.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import CoderModel from '../models/Coder.js';

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

// Crear un clan validando unicidad de nombre
export const create = async ({ name, description, teamLeader }) => {
  const existing = ClanModel.getByName(name);
  if (existing) throw new Error('Clan name already exists');

  return ClanModel.create({ name, description, teamLeader });
};

// Actualizar un clan existente; retorna null si no se encuentra
export const update = async (id, data) => {
  const clan = ClanModel.update(id, data);
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
