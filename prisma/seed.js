// prisma/seed.js
// Fills the database with test users and the 3 Culture and Arts services.
// Safe to run many times: upsert updates existing rows instead of duplicating them.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Form definitions (form_schema v1), copied from mca-infra-docs/form-schemas.
// require() reads each JSON file and turns it into a JavaScript object.
const artistSchema = require('./form-schemas/artist-registration.json');
const eventSchema = require('./form-schemas/event-permit.json');
const grantSchema = require('./form-schemas/arts-grant.json');

const prisma = new PrismaClient();

// ---------- Test users (all share the password Password123!) ----------
const users = [
  { name: 'Test Citizen', email: 'citizen@mca.test', nrc: '111111/11/1', phone: '0970000001', role: 'CITIZEN' },
  { name: 'Test Officer', email: 'officer@mca.test', nrc: '222222/22/1', phone: '0970000002', role: 'OFFICER' },
  { name: 'Test Admin', email: 'admin@mca.test', nrc: '333333/33/1', phone: '0970000003', role: 'ADMIN' },
];

// ---------- Services ----------
// formSchema = the pages of the form the citizen fills in (from the JSON files)
// steps      = the approval stages, saved in the workflow_steps table
const services = [
  {
    name: 'Artist / Creative Registration',
    slug: 'artist-registration',
    description: 'Register as a musician, visual artist or performer and receive a registration certificate.',
    fee: 500,
    isPublished: true,
    formSchema: artistSchema,
    steps: [
      { stepOrder: 1, name: 'Officer Review', roleRequired: 'OFFICER' },
      { stepOrder: 2, name: 'Approval', roleRequired: 'ADMIN' },
    ],
  },
  {
    name: 'Event / Performance Permit',
    slug: 'event-permit',
    description: 'Apply for a permit to hold a concert, festival or public performance.',
    fee: 500, // placeholder until the Team Lead sets the attendance-based fees
    isPublished: true,
    formSchema: eventSchema,
    steps: [
      { stepOrder: 1, name: 'Officer Review', roleRequired: 'OFFICER' },
      { stepOrder: 2, name: 'Permit Approval', roleRequired: 'ADMIN' },
    ],
  },
  {
    name: 'Arts Grant Application',
    slug: 'arts-grant',
    description: 'Apply for funding for a creative project.',
    fee: 0,
    isPublished: true,
    formSchema: grantSchema,
    steps: [
      { stepOrder: 1, name: 'Eligibility Review', roleRequired: 'OFFICER' },
      { stepOrder: 2, name: 'Committee Review', roleRequired: 'OFFICER' },
      { stepOrder: 3, name: 'Final Decision', roleRequired: 'ADMIN' },
    ],
  },
];

// ---------- Save everything ----------
async function main() {
  // Hash the password once. The database stores only the hash, never the real password.
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Users: create if missing, leave alone if they already exist
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
  }

  // Services: create if missing, otherwise update them and replace their steps
  for (const { steps, ...data } of services) {
    await prisma.service.upsert({
      where: { slug: data.slug },
      update: { ...data, workflowSteps: { deleteMany: {}, create: steps } },
      create: { ...data, workflowSteps: { create: steps } },
    });
  }

  console.log('Seed complete: 3 users, 3 services');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());