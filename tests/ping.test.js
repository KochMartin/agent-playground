'use strict';

const request = require('supertest');
const app = require('../src/app');

describe('GET /ping', () => {
  it('should return HTTP 200', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
  });

  it('should return JSON content-type', async () => {
    const res = await request(app).get('/ping');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return { status: "ok" } in the body', async () => {
    const res = await request(app).get('/ping');
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should not return a body for unknown routes', async () => {
    const res = await request(app).get('/unknown');
    expect(res.statusCode).toBe(404);
  });
});
