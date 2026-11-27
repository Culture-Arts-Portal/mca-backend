// Register tests. Needs the Docker database running (uses DATABASE_URL from .env).
require('dotenv').config({ quiet: true });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-not-used-anywhere-real-123';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/db');

// A new email every run, so the test never clashes with old data.
const email = `jest-${Date.now()}@example.com`;
const goodBody = { name: 'Jest Citizen', email, password: 'Password123!', phone: '+260970000009', role: 'ADMIN' };

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });   // tidy up our own test user only
  await prisma.$disconnect();
});

test('register creates a CITIZEN, cleans the phone and returns a token', async () => {
  const res = await request(app).post('/api/auth/register').send(goodBody);

  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.user).toEqual({
    id: expect.any(Number), name: 'Jest Citizen', email, phone: '0970000009', role: 'CITIZEN',
  });

  // The token holds only sub + role (+ iat/exp), and our secret verifies it.
  const payload = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
  expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'role', 'sub']);
  expect(payload.role).toBe('CITIZEN');
});

test('the database stores a bcrypt hash, never the password', async () => {
  const user = await prisma.user.findUnique({ where: { email } });

  expect(user.passwordHash).not.toBe('Password123!');
  expect(await bcrypt.compare('Password123!', user.passwordHash)).toBe(true);
});

test('the same email again, in capitals, is refused with 409', async () => {
  const res = await request(app).post('/api/auth/register').send({ ...goodBody, email: email.toUpperCase() });

  expect(res.status).toBe(409);
  expect(res.body).toEqual({ success: false, data: null, message: 'An account with this email already exists' });
});

test('a missing name is refused with 400', async () => {
  const res = await request(app).post('/api/auth/register').send({ email: 'x@y.co', password: 'Password123!' });

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ success: false, data: null, message: 'Name is required' });
});