import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Coder from '../models/Coder.js';
import TeamLeader from '../models/TeamLeader.js';

const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const register = async ({ name, email, password, role = 'coder' }) => {
  const existingUser = await Coder.findOne({ email }) || await TeamLeader.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === 'teamLeader' || role === 'admin') {
    const tl = await TeamLeader.create({ name, email, password: hashedPassword, role });
    const token = generateToken(tl, tl.role);
    const { password: _, ...user } = tl.toJSON();
    return { user, token };
  }

  const coder = await Coder.create({ name, email, password: hashedPassword });
  const token = generateToken(coder, 'coder');
  const { password: _, ...userData } = coder.toJSON();
  return { user: userData, token };
};

export const login = async ({ email, password }) => {
  let user = await Coder.findOne({ email });
  let role = 'coder';

  if (!user) {
    user = await TeamLeader.findOne({ email });
    role = user?.role || 'teamLeader';
  }

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user, role);
  const { password: _, ...userData } = user.toJSON();
  return { user: userData, token };
};

export const getMe = async (userId, role) => {
  if (role === 'coder') {
    const user = await Coder.findById(userId).select('-password').populate('clan', 'name');
    return user;
  }
  const user = await TeamLeader.findById(userId).select('-password').populate('clans', 'name');
  return user;
};
