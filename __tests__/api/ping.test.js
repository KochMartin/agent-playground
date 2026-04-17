import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/ping';

describe('GET /api/ping', () => {
  it('returns 200 with { status: "ok" }', () => {
    const { req, res } = createMocks({ method: 'GET' });
    handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ status: 'ok' });
  });

  it('returns 405 for non-GET methods', () => {
    const { req, res } = createMocks({ method: 'POST' });
    handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: 'Method Not Allowed' });
  });
});
