// src/modules/services/services.controller.js
// Handles the HTTP request and response, and calls the service layer.
// Uses the shared helpers, so every module answers in the same shape:
//   ok()     -> { success: true, data, message }
//   AppError -> the error handler turns it into { success: false, data: null, message }
const servicesService = require('./services.service');
const { ok } = require('../../utils/respond');
const AppError = require('../../utils/AppError');

// GET /api/services
exports.list = async (req, res) => {
  const data = await servicesService.listPublished();
  ok(res, data, 'Services retrieved');
};

// GET /api/services/:slug
exports.getBySlug = async (req, res) => {
  const data = await servicesService.getBySlug(req.params.slug);
  if (!data) {
    throw new AppError(404, 'Service not found');
  }
  ok(res, data, 'Service retrieved');
};