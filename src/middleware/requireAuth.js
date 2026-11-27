// src/middleware/requireAuth.js
// The guard: lets a request through only with a valid token. Sets req.auth = { userId, role }.
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  // 1. Where's your pass?  The header looks like:  "Bearer eyJhbGci..."
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError(401, 'Please log in');
  }

  // 2. Is the stamp real and the pass still valid?
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw new AppError(401, 'Please log in');
  }

  // 3. Write down who this is, and let them through.
  req.auth = { userId: Number(payload.sub), role: payload.role };
  next();
};