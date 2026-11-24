// src/modules/services/services.service.js
// Database logic for services. No req/res here, only data.
const prisma = require('../../config/db');

exports.listPublished = () =>
  prisma.service.findMany({
    where: { isPublished: true },
    select: { id: true, name: true, slug: true, description: true, fee: true },
    orderBy: { name: 'asc' },
  });

exports.getBySlug = (slug) =>
  prisma.service.findUnique({
    where: { slug },
    include: { workflowSteps: { orderBy: { stepOrder: 'asc' } } },
  });
  