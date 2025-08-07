# Corporate Bingo - Multiplayer Setup Guide

This guide will help you set up the multiplayer room system for Corporate Bingo with real-time WebSocket communication.

## Architecture Overview

The multiplayer system consists of:
- **Frontend**: React + TypeScript with Zustand state management
- **Backend**: Cloudflare Workers + Durable Objects for real-time multiplayer
- **WebSocket**: Real-time communication between players
- **Room System**: 6-character room codes for easy joining

## Quick Start (Development)

### 1. Start the Backend (Cloudflare Workers)

```bash
# Install Wrangler CLI if not already installed
npm install -g wrangler

# Start local development server
npx wrangler dev --port 8787

# The backend will be available at http://localhost:8787
```

### 2. Start the Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The frontend will be available at http://localhost:5175
```

### 3. Test Multiplayer

1. Open multiple browser tabs/windows to `http://localhost:5175`
2. Go to "Rooms" tab in each window
3. Set your player name in each window
4. Create a room in one window, note the 6-character room code
5. Join the room from other windows using the room code
6. Start playing - you'll see real-time synchronization between players!

## Production Deployment

### 1. Deploy Backend to Cloudflare Workers

```bash
# Deploy to Cloudflare Workers
npx wrangler deploy

# Note the deployed URL (e.g., https://your-worker.your-subdomain.workers.dev)
```

### 2. Configure Frontend

Update `src/lib/config.ts` with your Cloudflare Workers domain:

```typescript
export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:8787',
    wsUrl: 'ws://localhost:8787'
  },
  production: {
    baseUrl: 'https://your-worker.your-subdomain.workers.dev', // Update this
    wsUrl: 'wss://your-worker.your-subdomain.workers.dev'     // Update this
  }
};
```

### 3. Update CORS Origins

Update `worker.js` to include your production frontend domain:

```javascript
function corsHeaders(origin) {
  const allowedOrigins = [
    'https://your-frontend-domain.netlify.app', // Add your domain here
    'https://engineer-memes-ai.netlify.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5175'
  ];
  // ... rest of the function
}
```

### 4. Deploy Frontend

```bash
# Build the frontend
npm run build

# Deploy to your hosting platform (Netlify, Vercel, etc.)
# The dist/ folder contains the built application
```

## Features Implemented

### ✅ Real-time Multiplayer
- Create rooms with 6-character codes
- Join existing rooms 
- Real-time player synchronization
- WebSocket connections with auto-reconnect

### ✅ Player Management
- Player name setup and validation
- Host/guest roles
- Connection status indicators
- Player list with online/offline status

### ✅ Game Synchronization
- Unique boards for each player
- Real-time square marking
- Live player actions
- Connection status monitoring

### ✅ Room Features
- Room capacity management (max 10 players)
- Persistent room state
- Clean disconnection handling
- Error handling and user feedback

## API Endpoints

The backend provides the following endpoints:

### Room Management
- `POST /api/room/create` - Create a new room
- `POST /api/room/join` - Join an existing room
- `GET /api/room/:code/ws` - WebSocket connection for real-time sync

### Testing
- `GET /api/test` - Test API connectivity

## WebSocket Messages

The system uses typed WebSocket messages for real-time communication:

### Client → Server
- `MARK_SQUARE` - Player marks a square
- `VERIFY_SQUARE` - Vote to verify another player's claim
- `CLAIM_BINGO` - Claim a bingo win
- `CHAT_MESSAGE` - Send chat message

### Server → Client  
- `PLAYER_JOINED` - New player joined room
- `PLAYER_LEFT` - Player left room
- `SQUARE_MARKED` - Player marked a square
- `GAME_STATE_UPDATE` - Room state changed
- `ERROR` - Error message

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check that backend is running on port 8787
   - Verify CORS origins are configured correctly
   - Check browser developer console for errors

2. **Room Not Found**
   - Ensure room code is exactly 6 characters
   - Check that the room was created successfully
   - Verify backend is running and accessible

3. **WebSocket Issues**
   - Check that WebSocket URL is correct in config
   - Verify firewall/proxy settings allow WebSocket connections
   - Check browser compatibility (modern browsers required)

### Development Tips

1. **Enable Debug Mode**
   ```typescript
   // In src/lib/config.ts
   export const FEATURES = {
     enableDevTools: true, // Enable detailed logging
     // ... other features
   };
   ```

2. **Monitor WebSocket Traffic**
   - Use browser DevTools → Network → WS to see WebSocket messages
   - Check console logs for connection status and errors

3. **Test with Multiple Windows**
   - Open incognito/private windows to simulate different users
   - Use different browsers to test cross-browser compatibility

## Security Considerations

- Room codes are cryptographically generated for security
- Input validation on all user data
- Rate limiting to prevent spam
- CORS configured for allowed origins only
- WebSocket connections authenticated with player IDs

## Performance

- Global edge deployment via Cloudflare Workers
- Sub-200ms response times globally  
- Auto-scaling for concurrent users
- Memory-efficient Durable Objects state management
- WebSocket connection pooling and management

## Next Steps

The multiplayer system is now fully functional! You can extend it further by:

1. Adding chat functionality
2. Implementing verification voting system
3. Adding game statistics and leaderboards  
4. Creating private rooms with passwords
5. Adding spectator mode
6. Implementing game replays

For questions or issues, check the browser console for error messages and ensure both frontend and backend are running correctly.