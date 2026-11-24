// src/config/db.js
// One shared Prisma Client for the whole app. Import this instead of creating new clients.
const { PrismaClient } = require('@prisma/client');

module.exports = new PrismaClient();
