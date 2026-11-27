// src/modules/applications/applications.controller.js
// Reads the request, calls the service, sends the answer.
const applicationsService = require('./applications.service');
const { ok } = require('../../utils/respond');

// POST /api/applications
exports.create = async (req, res) => {
  const { serviceSlug, formData } = req.body ?? {};
 const data = await applicationsService.create({ userId: req.auth.userId, serviceSlug, formData });
  ok(res, data, 'Application submitted', 201);
};