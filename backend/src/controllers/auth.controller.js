import * as authService from '../services/auth.service.js';

// Registro de usuario: extrae datos del body y delega al servicio
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
};

// Login de usuario: valida credenciales y retorna token JWT
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    res.status(401).json({ ok: false, message: error.message });
  }
};

// Obtener perfil del usuario autenticado (requiere token válido)
export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id, req.user.role);
    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }
    res.status(200).json({ ok: true, data: user });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};
