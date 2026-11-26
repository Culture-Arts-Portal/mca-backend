// src/modules/auth/auth.routes.js
// Maps URLs to controller functions. Mounted at /api/auth in src/routes/index.js.
const router = require('express').Router();
const controller = require('./auth.controller');

router.post('/register', controller.register);

module.exports = router;
router.post('/login', controller.login);