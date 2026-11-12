process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('allows the Vite loopback origin used by the local browser', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://127.0.0.1:5173');

    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173');
  });

  it('rejects unconfigured origins with a forbidden response', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'https://not-allowed.example');

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Origin not allowed by CORS');
  });
});
