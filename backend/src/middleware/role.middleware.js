/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 * @param  {...string} roles - List of allowed roles (e.g. 'admin', 'teamLeader', 'coder')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: 'Insufficient permissions' });
    }

    next();
  };
};
