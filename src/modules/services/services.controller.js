// src/modules/services/services.controller.js
// Handles the HTTP request and response, and calls the service layer.
const servicesService = require('./services.service');

exports.list = async (req, res, next) => {
  try {
    const data = await servicesService.listPublished();
    res.json({ success: true, data, message: 'Services retrieved' });
  } catch (err) {
    next(err);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const data = await servicesService.getBySlug(req.params.slug);
    if (!data) {
      return res.status(404).json({ success: false, data: null, message: 'Service not found' });
    }
    res.json({ success: true, data, message: 'Service retrieved' });
  } catch (err) {
    next(err);
  }
};
