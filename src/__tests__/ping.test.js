const request = require('supertest');
const app = require('../app');

describe('GET /ping', () => {
  it('should return 200 with { status: "ok" }', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should respond with JSON content-type', async () => {
    const res = await request(app).get('/ping');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
