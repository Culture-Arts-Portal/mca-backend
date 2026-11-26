// Settings for the test (there's no .env on GitHub). Must come BEFORE requiring the app.
// The database is never contacted by these tests, so the URL only has to be present.
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.PORT = '5000';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.JWT_SECRET = 'test-only-secret-not-used-anywhere-real-123';

const request = require('supertest');
const app = require('../src/app');

test('GET /api/health answers 200 in the standard success shape', async () => {
  const res = await request(app).get('/api/health');

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.status).toBe('ok');
});

test('an unknown route answers 404 in the standard error shape', async () => {
  const res = await request(app).get('/api/banana');

  expect(res.status).toBe(404);
  expect(res.body).toEqual({ success: false, data: null, message: 'No route for GET /api/banana' });
});

test('broken JSON answers 400 in the standard error shape', async () => {
  const res = await request(app)
    .post('/api/health')
    .set('Content-Type', 'application/json')
    .send('{ not json');

  expect(res.status).toBe(400);
  expect(res.body).toEqual({ success: false, data: null, message: 'Request body is not valid JSON' });
});

test('only our frontend is allowed by CORS', async () => {
  const res = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');

  expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
});
