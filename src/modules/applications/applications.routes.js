// src/modules/applications/applications.routes.js
// Mounted at /api/applications in src/routes/index.js.
const router = require('express').Router();
const auth = require('../../middleware/devAuth'); // TEMPORARY: switch to Person 2's auth once it's merged
const requireRole = require('../../middleware/requireRole');
const controller = require('./applications.controller');

router.post('/', auth, requireRole(['CITIZEN'], 'Only citizens can apply'), controller.create);

module.exports = router;