// src/modules/auth/auth.routes.js
// Maps URLs to controller functions. Mounted at /api/auth in src/routes/index.js.
const requireAuth = require('../../middleware/requireAuth');
const router = require('express').Router();
const controller = require('./auth.controller');


router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', requireAuth, controller.me);

module.exports = router;
