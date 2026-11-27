// /me + requireAuth tests. Needs the Docker database running.
require('dotenv').config({ quiet: true });
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-not-used-anywhere-real-123';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/db');

const email = `jest-me-${Date.now()}@example.com`;
const PLEASE_LOG_IN = { success: false, data: null, message: 'Please log in' };
let token;
let userId;

// Before the tests: register one user and keep their pass (token) and id.
beforeAll(async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'Me Tester', email, password: 'Password123!' });
  token = res.body.data.token;
  userId = res.body.data.user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
});

// A small helper: call GET /api/auth/me, with or without an Authorization header.
function callMe(authHeader) {
  const req = request(app).get('/api/auth/me');
  return authHeader ? req.set('Authorization', authHeader) : req;
}

test('1. a real pass returns the user from the database', async () => {
  const res = await callMe(`Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.data.user).toEqual({ id: userId, name: 'Me Tester', email, phone: null, role: 'CITIZEN' });
});

test('2. no pass -> 401', async () => {
  const res = await callMe();
  expect(res.status).toBe(401);
  expect(res.body).toEqual(PLEASE_LOG_IN);
});

test('3. rubbish, or the wrong word instead of Bearer -> 401', async () => {
  expect((await callMe('Bearer not-a-real-token')).status).toBe(401);
  expect((await callMe(`Basic ${token}`)).status).toBe(401);
});

test('4. a pass edited to say ADMIN -> 401', async () => {
  const [header, , signature] = token.split('.');   // keep parts 1 and 3, throw away part 2
  const fakeMiddle = Buffer.from(JSON.stringify({ sub: String(userId), role: 'ADMIN' })).toString('base64url');
  const edited = `${header}.${fakeMiddle}.${signature}`;
  expect((await callMe(`Bearer ${edited}`)).status).toBe(401);
});

test('5. a pass stamped with a different secret -> 401', async () => {
  const forged = jwt.sign({ sub: String(userId), role: 'ADMIN' }, 'an-attackers-own-secret-32-characters-long');
  expect((await callMe(`Bearer ${forged}`)).status).toBe(401);
});

test('6. a pass with "alg: none" (no stamp at all) -> 401', async () => {
  const unsigned = jwt.sign({ sub: String(userId), role: 'ADMIN' }, null, { algorithm: 'none' });
  expect((await callMe(`Bearer ${unsigned}`)).status).toBe(401);
});

test('7. an expired pass -> 401', async () => {
  const expired = jwt.sign({ sub: String(userId), role: 'CITIZEN' }, process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: -10 });          // "expired 10 seconds ago"
  expect((await callMe(`Bearer ${expired}`)).status).toBe(401);
});

test('8. a real pass for an account that was deleted -> 401', async () => {
  await prisma.user.delete({ where: { id: userId } });
  const res = await callMe(`Bearer ${token}`);
  expect(res.status).toBe(401);
  expect(res.body).toEqual(PLEASE_LOG_IN);
});