// src/modules/services/services.routes.js
// Maps URLs to controller functions. Mounted at /api/services in app.js.
const router = require('express').Router();
const controller = require('./services.controller');

router.get('/', controller.list);
router.get('/:slug', controller.getBySlug);

module.exports = router;