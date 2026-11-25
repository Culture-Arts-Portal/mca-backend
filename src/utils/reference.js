// src/utils/reference.js
// Makes the next reference number for this year, e.g. MCA-2026-00001.
const prisma = require('../config/db');

module.exports = async function nextReference() {
  const prefix = `MCA-${new Date().getFullYear()}-`;
  const count = await prisma.application.count({ where: { referenceNo: { startsWith: prefix } } });
  return prefix + String(count + 1).padStart(5, '0');
};
