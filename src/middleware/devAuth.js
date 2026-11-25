// src/middleware/devAuth.js
// TEMPORARY stand-in for Person 2's auth middleware. Never used in production.
// It reads a user id from the X-Dev-User-Id header and loads that user, so req.user has
// exactly the shape the real auth will give: { id, role }.
const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { nodeEnv } = require('../config/env');

module.exports = async (req, res, next) => {
  if (nodeEnv === 'production') throw new AppError(500, 'devAuth must not run in production');

  const id = Number(req.header('X-Dev-User-Id'));
  const user = id ? await prisma.user.findUnique({ where: { id } }) : null;
  if (!user) throw new AppError(401, 'Please log in');

  req.user = { id: user.id, role: user.role };
  next();
};