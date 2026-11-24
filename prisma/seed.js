// prisma/seed.js
// Fills the database with test users and the 3 Culture and Arts services.
// Safe to run many times: upsert updates existing rows instead of duplicating them.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  { name: 'Test Citizen', email: 'citizen@mca.test', nrc: '111111/11/1', phone: '0970000001', role: 'CITIZEN' },
  { name: 'Test Officer', email: 'officer@mca.test', nrc: '222222/22/1', phone: '0970000002', role: 'OFFICER' },
  { name: 'Test Admin', email: 'admin@mca.test', nrc: '333333/33/1', phone: '0970000003', role: 'ADMIN' },
];

const services = [
  {
    name: 'Artist / Creative Registration',
    slug: 'artist-registration',
    description: 'Register as a musician, visual artist or performer and receive a registration certificate.',
    fee: 150,
    isPublished: true,
    formSchema: {
      fields: [
        { name: 'stageName', label: 'Stage / Artist Name', type: 'text', required: true },
        {
          name: 'discipline',
          label: 'Discipline',
          type: 'select',
          required: true,
          options: ['Music', 'Visual Arts', 'Dance', 'Theatre', 'Film', 'Literature'],
        },
        { name: 'yearsActive', label: 'Years Active', type: 'number', required: false },
        { name: 'province', label: 'Province', type: 'text', required: true },
        { name: 'portfolio', label: 'Portfolio (PDF)', type: 'file', required: false },
      ],
    },
    steps: [
      { stepOrder: 1, name: 'Officer Review', roleRequired: 'OFFICER' },
      { stepOrder: 2, name: 'Approval', roleRequired: 'ADMIN' },
    ],
  },
  {
    name: 'Event / Performance Permit',
    slug: 'event-permit',
    description: 'Apply for a permit to hold a concert, festival or public performance.',
    fee: 500,
    isPublished: true,
    formSchema: {
      fields: [
        { name: 'eventName', label: 'Event Name', type: 'text', required: true },
        { name: 'venue', label: 'Venue', type: 'text', required: true },
        { name: 'eventDate', label: 'Event Date', type: 'date', required: true },
        { name: 'expectedAttendance', label: 'Expected Attendance', type: 'number', required: true },
        { name: 'securityPlan', label: 'Security Plan (PDF)', type: 'file', required: true },
      ],
    },
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
    formSchema: {
      fields: [
        { name: 'projectTitle', label: 'Project Title', type: 'text', required: true },
        { name: 'summary', label: 'Project Summary', type: 'textarea', required: true },
        { name: 'amountRequested', label: 'Amount Requested (ZMW)', type: 'number', required: true },
        { name: 'budget', label: 'Budget (PDF)', type: 'file', required: true },
      ],
    },
    steps: [
      { stepOrder: 1, name: 'Eligibility Review', roleRequired: 'OFFICER' },
      { stepOrder: 2, name: 'Committee Review', roleRequired: 'OFFICER' },
      { stepOrder: 3, name: 'Final Decision', roleRequired: 'ADMIN' },
    ],
  },
];

async function main() {
  // All test users share this password: Password123!
  const passwordHash = await bcrypt.hash('Password123!', 10);

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash },
    });
  }

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