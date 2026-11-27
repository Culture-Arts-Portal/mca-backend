// requireRole tests. No database needed: we build a tiny app and make our own tokens.
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.PORT = '5000';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.JWT_SECRET = 'test-only-secret-not-used-anywhere-real-123';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const requireAuth = require('../src/middleware/requireAuth');
const requireRole = require('../src/middleware/requireRole');
const errorHandler = require('../src/middleware/errorHandler');

// A tiny practice app with two pretend doors.
const app = express();
app.get('/admin-only', requireAuth, requireRole('ADMIN'), (req, res) => res.json({ inside: true }));
app.get('/staff-only', requireAuth, requireRole(['OFFICER', 'ADMIN'], 'Only staff can do this'),
  (req, res) => res.json({ inside: true }));
app.get('/forgot-the-guard', requireRole('ADMIN'), (req, res) => res.json({ inside: true }));
app.use(errorHandler);

// Make a real pass for any role.
const passFor = (role) =>
  'Bearer ' + jwt.sign({ sub: '1', role }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });

test('ADMIN gets through the admin door', async () => {
  const res = await request(app).get('/admin-only').set('Authorization', passFor('ADMIN'));
  expect(res.status).toBe(200);
});

test('CITIZEN and OFFICER are refused at the admin door with 403', async () => {
  for (const role of ['CITIZEN', 'OFFICER']) {
    const res = await request(app).get('/admin-only').set('Authorization', passFor(role));
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ success: false, data: null, message: 'You do not have permission to do this' });
  }
});

test('the staff door lets OFFICER and ADMIN in, and refuses CITIZEN with its own message', async () => {
  expect((await request(app).get('/staff-only').set('Authorization', passFor('OFFICER'))).status).toBe(200);
  expect((await request(app).get('/staff-only').set('Authorization', passFor('ADMIN'))).status).toBe(200);

  const res = await request(app).get('/staff-only').set('Authorization', passFor('CITIZEN'));
  expect(res.status).toBe(403);
  expect(res.body.message).toBe('Only staff can do this');
});

test('no pass at a role door is 401, not 403', async () => {
  expect((await request(app).get('/admin-only')).status).toBe(401);
});

test('a door that forgot requireAuth stays closed (fails safe)', async () => {
  expect((await request(app).get('/forgot-the-guard')).status).toBe(401);
});