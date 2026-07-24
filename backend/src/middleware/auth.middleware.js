import jwt from 'jsonwebtoken';

// Middleware de autenticación: valida el token JWT del header Authorization
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Rechazar si no se envía header o no tiene formato Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar firma y expiración del token; adjuntar payload decodificado a req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
  }
};
