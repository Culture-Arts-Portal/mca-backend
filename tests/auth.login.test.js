// Login tests. Needs the Docker database running (uses DATABASE_URL from .env).
require('dotenv').config({ quiet: true });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-not-used-anywhere-real-123';

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

const email = `jest-login-${Date.now()}@example.com`;
const password = 'Password123!';
const WRONG = { success: false, data: null, message: 'Email or password is incorrect' };

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ name: 'Login Tester', email, password });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

test('the right email and password log in', async () => {
  const res = await request(app).post('/api/auth/login').send({ email, password });

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('Logged in');
  expect(res.body.data.token).toMatch(/^eyJ/);
  expect(res.body.data.user.email).toBe(email);
  expect(res.body.data.user.passwordHash).toBeUndefined();
});

test('the email is not case-sensitive', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: email.toUpperCase(), password });
  expect(res.status).toBe(200);
});

test('a wrong password and an unknown email get the SAME 401 answer', async () => {
  const wrongPassword = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass123!' });
  const unknownEmail = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password });

  expect(wrongPassword.status).toBe(401);
  expect(unknownEmail.status).toBe(401);
  expect(wrongPassword.body).toEqual(WRONG);
  expect(unknownEmail.body).toEqual(WRONG);
});

test('a missing password is refused with 400', async () => {
  const res = await request(app).post('/api/auth/login').send({ email });
  expect(res.status).toBe(400);
  expect(res.body.message).toBe('Email and password are required');
});