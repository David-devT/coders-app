// Middleware de control de acceso por roles (RBAC)
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Comprueba que la petición contenga un usuario autenticado
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }

    // Valida si el rol del usuario está dentro de los roles autorizados para la ruta
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: 'Insufficient permissions' });
    }

    next();
  };
};
