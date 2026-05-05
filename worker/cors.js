// CORS helper shared by all route modules
export function corsHeaders(origin) {
  const allowedOrigins = [
    'https://playjargon.com',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180'
  ];

  const validOrigin = allowedOrigins.includes(origin) ? origin : null;

  return {
    'Access-Control-Allow-Origin': validOrigin || 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Player-ID',
    'Access-Control-Max-Age': '86400',
  };
}

export const JSON_CT = { 'Content-Type': 'application/json' };
