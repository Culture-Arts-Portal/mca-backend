// src/middleware/requireRole.js
// Lets a request through only if the logged-in user has one of the given roles.
// Use it after the auth middleware:  requireRole(['OFFICER', 'ADMIN'])
const AppError = require('../utils/AppError');

module.exports = (roles, message = 'You are not allowed to do this') => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) throw new AppError(403, message);
  next();
};
