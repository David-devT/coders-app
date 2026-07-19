import Coder from '../models/Coder.js';
import bcrypt from 'bcryptjs';

export const getAll = async () => {
  return Coder.find().select('-password').populate('clan', 'name');
};

export const getById = async (id) => {
  return Coder.findById(id).select('-password').populate('clan', 'name');
};

export const create = async ({ name, email, password, clan }) => {
  const existing = await Coder.findOne({ email });
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const coder = await Coder.create({ name, email, password: hashedPassword, clan });
  const { password: _, ...result } = coder.toJSON();
  return result;
};

export const update = async (id, data) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  } else {
    delete data.password;
  }

  const coder = await Coder.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .select('-password')
    .populate('clan', 'name');

  if (!coder) throw new Error('Coder not found');
  return coder;
};

export const remove = async (id) => {
  const coder = await Coder.findByIdAndDelete(id);
  if (!coder) throw new Error('Coder not found');
  return coder;
};
