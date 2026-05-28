const request = require('supertest');
const app = require('./app');

describe('GET /ping', () => {
  it('should return 200 with { status: "ok" }', async () => {
    const response = await request(app).get('/ping');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should return JSON content-type', async () => {
    const response = await request(app).get('/ping');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should not return an error body', async () => {
    const response = await request(app).get('/ping');

    expect(response.body).not.toHaveProperty('error');
  });
});
