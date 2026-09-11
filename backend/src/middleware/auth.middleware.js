import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';

// Clave secreta para la firma y verificación de tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'coders_app_super_secret_jwt_key_2026!';

// Middleware que valida el token JWT en el encabezado Authorization
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica que exista el encabezado y tenga el prefijo Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decodifica y verifica la vigencia del token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Asigna el usuario autenticado a la solicitud
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
  }
};
