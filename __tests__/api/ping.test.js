/**
 * Tests for GET /api/ping endpoint
 */
import handler from '../../src/pages/api/ping';

describe('/api/ping', () => {
  let req;
  let res;

  beforeEach(() => {
    // Mock request object
    req = {
      method: 'GET',
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: undefined,
      responseBody: undefined,
    };

    // Track status and body
    res.status.mockImplementation((code) => {
      res.statusCode = code;
      return res;
    });

    res.json.mockImplementation((body) => {
      res.responseBody = body;
      return res;
    });
  });

  test('GET /api/ping returns 200 with pong status', () => {
    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(res.responseBody).toHaveProperty('status', 'pong');
  });

  test('GET /api/ping returns a timestamp', () => {
    handler(req, res);

    expect(res.responseBody).toHaveProperty('timestamp');
    // Verify it's a valid ISO string
    expect(() => new Date(res.responseBody.timestamp)).not.toThrow();
  });

  test('POST /api/ping returns 405 Method Not Allowed', () => {
    req.method = 'POST';
    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  test('DELETE /api/ping returns 405 Method Not Allowed', () => {
    req.method = 'DELETE';
    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  test('GET /api/ping response contains valid JSON', () => {
    handler(req, res);

    expect(() => JSON.stringify(res.responseBody)).not.toThrow();
  });
});
