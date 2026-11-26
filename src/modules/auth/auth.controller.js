// src/modules/auth/auth.controller.js
// Reads the request, calls validation and the service, sends the answer.
const { validateRegister } = require('./auth.validation');
const authService = require('./auth.service');
const { ok } = require('../../utils/respond');

// POST /api/auth/register
exports.register = async (req, res) => {
  const input = validateRegister(req.body);          // throws 400 if bad
  const data = await authService.register(input);    // throws 409 if email taken
  ok(res, data, 'Account created', 201);
};