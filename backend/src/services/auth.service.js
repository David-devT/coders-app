import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CoderModel from '../models/Coder.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import ClanModel from '../models/Clan.js';

const JWT_SECRET = process.env.JWT_SECRET || 'coders_app_super_secret_jwt_key_2026!';

/**
 * Generates a signed JWT valid for 24h
 * @param {object} user 
 * @param {string} role 
 * @returns {string}
 */
function generateToken(user, role) {
  return jwt.sign(
    { id: user.id, email: user.email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Strips password field from user object
 * @param {object} user 
 * @returns {object}
 */
function sanitize(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

/**
 * Registers a new user account with default role 'coder'.
 * @param {{ name: string, email: string, password: string }} data 
 * @returns {Promise<{ user: object, token: string }>}
 */
export const register = async ({ name, email, password }) => {
  if (!name || !name.trim()) throw new Error('Name is required');
  if (!email || !email.trim()) throw new Error('Email is required');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

  const normalizedEmail = email.trim().toLowerCase();

  const existingCoder = CoderModel.getByEmail(normalizedEmail);
  const existingTL = TeamLeaderModel.getByEmail(normalizedEmail);
  if (existingCoder || existingTL) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const coder = CoderModel.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  const token = generateToken(coder, 'coder');
  return {
    user: { ...sanitize(coder), role: 'coder' },
    token,
  };
};

/**
 * Logs in a user, authenticating credentials across Coders and Team Leaders.
 * @param {{ email: string, password: string }} data 
 * @returns {Promise<{ user: object, token: string }>}
 */
export const login = async ({ email, password }) => {
  if (!email || !password) throw new Error('Email and password are required');

  const normalizedEmail = email.trim().toLowerCase();
  let user = CoderModel.getByEmail(normalizedEmail);
  let role = 'coder';

  if (!user) {
    user = TeamLeaderModel.getByEmail(normalizedEmail);
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
  return {
    user: { ...sanitize(user), role },
    token,
  };
};

/**
 * Retrieves the profile of the authenticated user, enriched with clan information.
 * @param {string} userId 
 * @param {string} role 
 * @returns {Promise<object|null>}
 */
export const getMe = async (userId, role) => {
  if (role === 'coder') {
    const user = CoderModel.getById(userId);
    if (!user) return null;
    const s = sanitize(user);
    if (s.clan) {
      const clan = ClanModel.getById(s.clan);
      s.clan = clan ? { id: clan.id, name: clan.name } : null;
    }
    return { ...s, role: 'coder' };
  }

  const user = TeamLeaderModel.getById(userId);
  if (!user) return null;
  const s = sanitize(user);
  const clans = ClanModel.getAll();
  s.clans = clans
    .filter((c) => c.teamLeader === s.id)
    .map((c) => ({ id: c.id, name: c.name }));

  return s;
};
