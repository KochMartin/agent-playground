/**
 * GET /api/ping
 * 
 * A simple ping endpoint that returns a pong response.
 * Useful for health checks and verifying the API is running.
 * 
 * @returns {Object} JSON response with status and timestamp
 */
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'pong',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
