import TeamLeader from '../models/TeamLeader.js';
import bcrypt from 'bcryptjs';

export const getAll = async () => {
  return TeamLeader.find().select('-password').populate('clans', 'name');
};

export const getById = async (id) => {
  return TeamLeader.findById(id).select('-password').populate('clans', 'name');
};

export const create = async ({ name, email, password, role }) => {
  const existing = await TeamLeader.findOne({ email });
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const tl = await TeamLeader.create({ name, email, password: hashedPassword, role });
  const { password: _, ...result } = tl.toJSON();
  return result;
};

export const update = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  } else {
    delete data.password;
  }

  const tl = await TeamLeader.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .select('-password')
    .populate('clans', 'name');

  if (!tl) throw new Error('Team Leader not found');
  return tl;
};

export const remove = async (id) => {
  const tl = await TeamLeader.findByIdAndDelete(id);
  if (!tl) throw new Error('Team Leader not found');
  return tl;
};
