import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CoderModel from '../models/Coder.js';
import TeamLeaderModel from '../models/TeamLeader.js';
import ClanModel from '../models/Clan.js';

// Genera un token JWT con id, email y role del usuario, expira en 24h
function generateToken(user, role) {
  return jwt.sign({ id: user.id, email: user.email, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Elimina el campo password del objeto antes de retornarlo al cliente
function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

// Registro de usuario público: solo permite crear cuentas con rol 'coder'.
// Para crear team leaders o admins, usar los endpoints protegidos /api/team-leaders.
export const register = async ({ name, email, password }) => {
  const existing = CoderModel.getByEmail(email) || TeamLeaderModel.getByEmail(email);
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const coder = CoderModel.create({ name, email, password: hashedPassword });
  const token = generateToken(coder, 'coder');
  return { user: sanitize(coder), token };
};

// Login: busca el email en ambos modelos, valida password con bcrypt y retorna token JWT
export const login = async ({ email, password }) => {
  let user = CoderModel.getByEmail(email);
  let role = 'coder';

  if (!user) {
    user = TeamLeaderModel.getByEmail(email);
    role = user?.role || 'teamLeader';
  }

  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken(user, role);
  return { user: sanitize(user), token };
};

// Retorna el perfil del usuario autenticado, enriquecido con datos del clan(s) asociado(s)
export const getMe = async (userId, role) => {
  if (role === 'coder') {
    const user = CoderModel.getById(userId);
    if (!user) return null;
    const s = sanitize(user);
    // Adjunta información resumida del clan al que pertenece el coder
    if (s.clan) {
      const clan = ClanModel.getById(s.clan);
      s.clan = clan ? { id: clan.id, name: clan.name } : null;
    }
    return s;
  }

  const user = TeamLeaderModel.getById(userId);
  if (!user) return null;
  const s = sanitize(user);
  // Filtra y adjunta la lista de clans que lidera este usuario
  s.clans = ClanModel.getAll()
    .filter((c) => c.teamLeader === s.id)
    .map((c) => ({ id: c.id, name: c.name }));
  return s;
};
