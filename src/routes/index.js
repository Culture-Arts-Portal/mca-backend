// The one list of every API route. app.js mounts this whole file at /api,
// so the paths here leave out "/api": '/health' answers GET /api/health.
// Each module adds ONE line here instead of editing app.js.
const router = require('express').Router();
const { ok } = require('../utils/respond');

router.get('/health', (req, res) => ok(res, { status: 'ok', service: 'mca-backend' }));

router.use('/services', require('../modules/services/services.routes'));   // Person 3
// Week 2: router.use('/auth', require('../modules/auth/auth.routes'));     // Person 2

router.use('/applications', require('../modules/applications/applications.routes'));   // Person 3

module.exports = router;
