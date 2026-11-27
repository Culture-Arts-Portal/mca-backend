// src/modules/applications/applications.routes.js
// Mounted at /api/applications in src/routes/index.js.
const router = require('express').Router();
const requireAuth = require('../../middleware/requireAuth');   // Person 2: checks the login token, sets req.auth
const requireRole = require('../../middleware/requireRole');   // Person 2: checks req.auth.role
const controller = require('./applications.controller');

router.post('/', requireAuth, requireRole('CITIZEN', 'Only citizens can apply'), controller.create);

module.exports = router;