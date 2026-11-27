// src/middleware/requireRole.js
// The "staff only" sign. Always goes AFTER requireAuth, which sets req.auth.
// Usage:  requireRole('ADMIN')
//         requireRole(['OFFICER', 'ADMIN'])
//         requireRole('CITIZEN', 'Only citizens can apply')   // your own 403 message
const AppError = require('../utils/AppError');

module.exports = (roles, message = 'You do not have permission to do this') => {
  const allowed = [].concat(roles);              // 'ADMIN' -> ['ADMIN'];  ['A','B'] stays as it is

  return (req, res, next) => {
    if (!req.auth) {
      throw new AppError(401, 'Please log in');  // someone forgot requireAuth before this
    }
    if (!allowed.includes(req.auth.role)) {
      throw new AppError(403, message);
    }
    next();
  };
};