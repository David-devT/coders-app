// Middleware de autorización por roles: rechaza si el usuario no tiene el rol requerido
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }

    // Verificar que el rol del usuario esté dentro de los roles permitidos
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: 'Insufficient permissions' });
    }

    next();
  };
};
