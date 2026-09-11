import ClanModel from '../models/Clan.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import CoderModel from '../models/Coder.js';
import TaskModel from '../models/Task.js';

// Campos permitidos para actualización de un clan
const ALLOWED_UPDATE = ['name', 'description', 'teamLeader', 'coders'];

// Filtra las propiedades permitidas en las peticiones de actualización
function pickAllowed(data, allowed) {
  const result = {};
  for (const key of allowed) {
    if (data[key] !== undefined) result[key] = data[key];
  }
  return result;
}

// Resuelve y adjunta los datos de líder y lista de miembros del clan
function enrich(clan) {
  if (!clan) return null;
  const result = { ...clan };

  if (result.teamLeader) {
    const tl = TeamLeaderModel.getById(result.teamLeader);
    result.teamLeader = tl ? { id: tl.id, name: tl.name, email: tl.email } : null;
  } else {
    result.teamLeader = null;
  }

  if (Array.isArray(result.coders) && result.coders.length > 0) {
    const codersList = result.coders
      .map((cId) => {
        const c = CoderModel.getById(cId);
        return c ? { id: c.id, name: c.name, email: c.email } : null;
      })
      .filter(Boolean);
    result.coders = codersList;
  } else {
    result.coders = [];
  }

  return result;
}

// Retorna todos los clanes con líderes y miembros enriquecidos
export const getAll = async () => {
  const clans = ClanModel.getAll();
  return clans.map(enrich);
};

// Retorna un clan por su identificador
export const getById = async (id) => {
  const clan = ClanModel.getById(id);
  return clan ? enrich(clan) : null;
};

// Crea un clan verificando nombre único, límite de 2 clanes por TL y asignando coders
export const create = async ({ name, description, teamLeader, coders }) => {
  if (!name || !name.trim()) throw new Error('Clan name is required');

  const existing = ClanModel.getByName(name.trim());
  if (existing) throw new Error('Clan name already exists');

  let assignedTL = null;
  if (teamLeader) {
    const tl = TeamLeaderModel.getById(teamLeader);
    if (!tl) throw new Error('Assigned Team Leader not found');

    // Regla de negocio: un Team Leader no puede liderar más de 2 clanes
    const allClans = ClanModel.getAll();
    const tlClans = allClans.filter((c) => c.teamLeader === teamLeader);
    if (tlClans.length >= 2) {
      throw new Error('Team Leader can only lead a maximum of 2 clans');
    }
    assignedTL = tl.id;
  }

  const coderIds = Array.isArray(coders) ? coders : [];
  const created = ClanModel.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    teamLeader: assignedTL,
    coders: coderIds,
  });

  // Asigna el nuevo clan en los registros individuales de cada coder
  for (const cId of coderIds) {
    const coder = CoderModel.getById(cId);
    if (coder) {
      CoderModel.update(cId, { clan: created.id });
    }
  }

  return enrich(created);
};

// Actualiza los datos del clan, valida límite de asignación de TL y sincroniza lista de coders
export const update = async (id, data) => {
  const current = ClanModel.getById(id);
  if (!current) throw new Error('Clan not found');

  const safe = pickAllowed(data, ALLOWED_UPDATE);

  if (safe.name) {
    const normalizedName = safe.name.trim();
    if (normalizedName.toLowerCase() !== current.name.toLowerCase()) {
      const existing = ClanModel.getByName(normalizedName);
      if (existing) throw new Error('Clan name already exists');
      safe.name = normalizedName;
    }
  }

  if (safe.teamLeader !== undefined) {
    if (safe.teamLeader) {
      const tl = TeamLeaderModel.getById(safe.teamLeader);
      if (!tl) throw new Error('Assigned Team Leader not found');

      const allClans = ClanModel.getAll();
      const tlClans = allClans.filter((c) => c.teamLeader === safe.teamLeader && c.id !== id);
      if (tlClans.length >= 2) {
        throw new Error('Team Leader can only lead a maximum of 2 clans');
      }
    } else {
      safe.teamLeader = null;
    }
  }

  // Sincronización de membresía en coders removidos y agregados
  if (safe.coders !== undefined && Array.isArray(safe.coders)) {
    const oldCoders = current.coders || [];
    const newCoders = safe.coders;

    for (const cId of oldCoders) {
      if (!newCoders.includes(cId)) {
        CoderModel.update(cId, { clan: null });
      }
    }

    for (const cId of newCoders) {
      if (!oldCoders.includes(cId)) {
        CoderModel.update(cId, { clan: id });
      }
    }
  }

  const updatedClan = ClanModel.update(id, safe);
  return enrich(updatedClan);
};

// Elimina el clan y desvincula a sus miembros y tareas asignadas
export const remove = async (id) => {
  const clan = ClanModel.remove(id);
  if (!clan) throw new Error('Clan not found');

  // Desvincula a los coders miembros
  const coders = CoderModel.getAll();
  for (const coder of coders) {
    if (coder.clan === id) {
      CoderModel.update(coder.id, { clan: null });
    }
  }

  // Desvincula las tareas del clan
  const tasks = TaskModel.getAll();
  for (const task of tasks) {
    if (task.clanId === id) {
      TaskModel.update(task.id, { clanId: null });
    }
  }

  return clan;
};
