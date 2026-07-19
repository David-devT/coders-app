import Clan from '../models/Clan.js';

export const getAll = async () => {
  return Clan.find().populate('teamLeader', 'name email').populate('coders', 'name email');
};

export const getById = async (id) => {
  return Clan.findById(id).populate('teamLeader', 'name email').populate('coders', 'name email');
};

export const create = async ({ name, description, teamLeader }) => {
  const existing = await Clan.findOne({ name });
  if (existing) throw new Error('Clan name already exists');

  return Clan.create({ name, description, teamLeader });
};

export const update = async (id, data) => {
  const clan = await Clan.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('teamLeader', 'name email')
    .populate('coders', 'name email');

  if (!clan) throw new Error('Clan not found');
  return clan;
};

export const remove = async (id) => {
  const clan = await Clan.findByIdAndDelete(id);
  if (!clan) throw new Error('Clan not found');
  return clan;
};
