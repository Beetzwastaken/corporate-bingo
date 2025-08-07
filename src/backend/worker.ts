// Cloudflare Worker Entry Point for Multiplayer Buzzword Bingo
// Handles routing and initializes Durable Objects

import { BingoRoomObject } from './BingoRoomObject';
import { RoomError, ROOM_CONFIG } from './types';

export interface Env {
  BINGO_ROOMS: DurableObjectNamespace;
  // Add other environment variables as needed
  CORS_ORIGINS?: string;
  DEBUG?: string;
}

export { BingoRoomObject };

// CORS headers for frontend integration
const getCorsHeaders = (origin: string, env: Env): Record<string, string> => {
  const allowedOrigins = env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'https://engineer-memes.netlify.app'];
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const origin = request.headers.get('Origin') || '';
      const corsHeaders = getCorsHeaders(origin, env);

      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders,
        });
      }

      // API Routes
      if (url.pathname.startsWith('/api/bingo/')) {
        return await handleBingoAPI(request, env, corsHeaders);
      }

      // Health check
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }

      // Default response
      return new Response('Multiplayer Buzzword Bingo API', {
        headers: corsHeaders,
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders('*', env),
        },
      });
    }
  },
};

async function handleBingoAPI(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/bingo', '');

  try {
    switch (path) {
      case '/create':
        return await handleCreateRoom(request, env, corsHeaders);
      case '/join':
        return await handleJoinRoom(request, env, corsHeaders);
      case '/status':
        return await handleRoomStatus(request, env, corsHeaders);
      case '/rooms':
        return await handleListRooms(request, env, corsHeaders);
      default:
        // Route to specific room
        const roomCodeMatch = path.match(/^\/room\/([A-Z0-9]+)(.*)$/);
        if (roomCodeMatch) {
          const [, roomCode, subPath] = roomCodeMatch;
          return await handleRoomRequest(request, env, corsHeaders, roomCode, subPath);
        }
        
        return new Response('Not Found', {
          status: 404,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    if (error instanceof RoomError) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        code: error.code,
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    console.error('API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

async function handleCreateRoom(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const data = await request.json();
    const { roomName, playerName, maxPlayers, settings } = data;

    // Validation
    if (!roomName || roomName.length > ROOM_CONFIG.MAX_ROOM_NAME_LENGTH) {
      throw new RoomError('Invalid room name', 'INVALID_REQUEST');
    }

    if (!playerName || playerName.length > ROOM_CONFIG.MAX_PLAYER_NAME_LENGTH) {
      throw new RoomError('Invalid player name', 'INVALID_REQUEST');
    }

    // Generate room code and get Durable Object
    const roomCode = generateRoomCode();
    const roomId = env.BINGO_ROOMS.idFromName(roomCode);
    const roomObject = env.BINGO_ROOMS.get(roomId);

    // Forward request to Durable Object
    const response = await roomObject.fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ roomName, playerName, maxPlayers, settings }),
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    throw error;
  }
}

async function handleJoinRoom(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const data = await request.json();
    const { roomCode, playerName } = data;

    if (!roomCode || !playerName) {
      throw new RoomError('Room code and player name are required', 'INVALID_REQUEST');
    }

    // Get Durable Object for the room
    const roomId = env.BINGO_ROOMS.idFromName(roomCode.toUpperCase());
    const roomObject = env.BINGO_ROOMS.get(roomId);

    // Forward request to Durable Object
    const response = await roomObject.fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ roomCode: roomCode.toUpperCase(), playerName }),
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    throw error;
  }
}

async function handleRoomStatus(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  const url = new URL(request.url);
  const roomCode = url.searchParams.get('roomCode');

  if (!roomCode) {
    throw new RoomError('Room code is required', 'INVALID_REQUEST');
  }

  try {
    // Get Durable Object for the room
    const roomId = env.BINGO_ROOMS.idFromName(roomCode.toUpperCase());
    const roomObject = env.BINGO_ROOMS.get(roomId);

    // Forward request to Durable Object
    const response = await roomObject.fetch(`${request.url}?roomCode=${roomCode.toUpperCase()}`, {
      method: 'GET',
      headers: request.headers,
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    throw error;
  }
}

async function handleListRooms(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  // Note: This would require a separate Durable Object to track all active rooms
  // For now, return a placeholder response
  return new Response(JSON.stringify({
    success: true,
    rooms: [],
    message: 'Room listing not implemented yet',
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

async function handleRoomRequest(
  request: Request, 
  env: Env, 
  corsHeaders: Record<string, string>, 
  roomCode: string, 
  subPath: string
): Promise<Response> {
  try {
    // Get Durable Object for the room
    const roomId = env.BINGO_ROOMS.idFromName(roomCode.toUpperCase());
    const roomObject = env.BINGO_ROOMS.get(roomId);

    // Construct the proper path for the room object
    const roomUrl = new URL(request.url);
    roomUrl.pathname = subPath || '/status';

    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      // Pass through WebSocket connection
      return await roomObject.fetch(roomUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }

    // Forward regular HTTP request
    const response = await roomObject.fetch(roomUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    throw error;
  }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < ROOM_CONFIG.CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// WebSocket connection handler helper
export async function handleWebSocketConnection(
  request: Request,
  env: Env,
  roomCode: string,
  playerId: string
): Promise<Response> {
  const roomId = env.BINGO_ROOMS.idFromName(roomCode.toUpperCase());
  const roomObject = env.BINGO_ROOMS.get(roomId);

  // Add query parameters for the Durable Object
  const url = new URL(request.url);
  url.searchParams.set('roomCode', roomCode.toUpperCase());
  url.searchParams.set('playerId', playerId);

  return await roomObject.fetch(url.toString(), {
    method: request.method,
    headers: request.headers,
  });
}

// Utility function for development/testing
export async function cleanupInactiveRooms(env: Env): Promise<number> {
  // This would require implementing a registry of active rooms
  // For now, return 0
  return 0;
}

// Rate limiting helper (for production use)
export function isRateLimited(request: Request): boolean {
  // Implement rate limiting logic here
  // Check IP address, request count, etc.
  return false;
}

// Input validation helpers
export function validateRoomName(name: string): boolean {
  return name && 
         name.length > 0 && 
         name.length <= ROOM_CONFIG.MAX_ROOM_NAME_LENGTH &&
         /^[a-zA-Z0-9\s\-_]+$/.test(name);
}

export function validatePlayerName(name: string): boolean {
  return name && 
         name.length > 0 && 
         name.length <= ROOM_CONFIG.MAX_PLAYER_NAME_LENGTH &&
         /^[a-zA-Z0-9\s\-_]+$/.test(name);
}

export function validateRoomCode(code: string): boolean {
  return code && 
         code.length === ROOM_CONFIG.CODE_LENGTH &&
         /^[A-Z0-9]+$/.test(code);
}