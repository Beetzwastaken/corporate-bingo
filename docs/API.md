# Buzzword Bingo API Documentation

Complete API reference for the Corporate Buzzword Bingo multiplayer backend.

## Base URL
- **Development**: `http://localhost:8787`
- **Production**: `https://buzzword-bingo.your-worker.workers.dev`

## Authentication
No authentication required. Rooms are secured by 6-character codes.

## CORS Policy
- **Allowed Origins**: `https://engineer-memes-ai.netlify.app`, `http://localhost:*`
- **Methods**: `GET`, `POST`, `OPTIONS`
- **Headers**: `Content-Type`

## Endpoints

### Create Room
Create a new multiplayer game room.

**Endpoint**: `POST /api/room/create`

**Request Body**:
```json
{
  "roomName": "Weekly Standup Bingo",
  "playerName": "Alice"
}
```

**Response** (201):
```json
{
  "success": true,
  "roomCode": "ABC123",
  "playerId": "bdc617eba6116156ed72605d2099e130",
  "board": ["Synergy", "Deep Dive", "Circle Back", "FREE SPACE", ...],
  "isHost": true
}
```

**Error Responses**:
- `400`: Invalid room name or player name
- `500`: Internal server error

### Join Room
Join an existing game room with a room code.

**Endpoint**: `POST /api/room/join`

**Request Body**:
```json
{
  "roomCode": "ABC123",
  "playerName": "Bob"
}
```

**Response** (200):
```json
{
  "success": true,
  "playerId": "6e12f16d362cb967cb4ac008e4f822e3",
  "board": ["Leverage", "Touch Base", "Move the Needle", "FREE SPACE", ...],
  "roomName": "Weekly Standup Bingo",
  "playerCount": 2,
  "roundNumber": 1
}
```

**Error Responses**:
- `400`: Invalid room code or player name, or room is full (10 players max)
- `404`: Room not found or inactive

### WebSocket Connection
Real-time communication for gameplay.

**Endpoint**: `GET /api/room/{roomCode}/ws?playerId={playerId}`

**Upgrade**: `websocket`

**Messages**: See WebSocket Protocol section below

### Health Check
Test API connectivity and get system status.

**Endpoint**: `GET /api/test`

**Response** (200):
```json
{
  "message": "API is working",
  "buzzwordCount": 414
}
```

## WebSocket Protocol

### Client → Server Messages

#### Claim Buzzword
Player claims they heard a buzzword on their board.

```json
{
  "type": "CLAIM_BUZZWORD",
  "buzzword": "Synergy",
  "squareIndex": 0
}
```

#### Verification Vote
Vote on another player's buzzword claim.

```json
{
  "type": "VERIFY_VOTE",
  "verificationId": "abc123def456",
  "vote": "approve",  // or "reject"
  "speaker": "Manager/Boss"  // who said the buzzword
}
```

#### Ping
Keep connection alive.

```json
{
  "type": "PING"
}
```

### Server → Client Messages

#### Room State
Initial room state when connecting.

```json
{
  "type": "ROOM_STATE",
  "players": [
    {
      "id": "player123",
      "name": "Alice",
      "isHost": true,
      "currentScore": 50,
      "totalScore": 200
    }
  ],
  "roundNumber": 2
}
```

#### Player Joined
New player joined the room.

```json
{
  "type": "PLAYER_JOINED",
  "player": {
    "id": "player456",
    "name": "Bob"
  },
  "playerCount": 3
}
```

#### Player Left
Player disconnected from the room.

```json
{
  "type": "PLAYER_LEFT",
  "playerId": "player456",
  "playerName": "Bob",
  "playerCount": 2
}
```

#### Verify Buzzword
Request verification for a claimed buzzword.

```json
{
  "type": "VERIFY_BUZZWORD",
  "verificationId": "abc123def456",
  "claimerName": "Alice",
  "buzzword": "Synergy",
  "question": "Who said \"Synergy\"?",
  "options": [
    "Manager/Boss",
    "Client",
    "Alice",
    "Other teammate",
    "Someone else"
  ]
}
```

#### Claim Approved
Buzzword claim was approved by vote.

```json
{
  "type": "CLAIM_APPROVED",
  "claimerName": "Alice",
  "buzzword": "Synergy",
  "points": 10
}
```

#### Claim Rejected
Buzzword claim was rejected.

```json
{
  "type": "CLAIM_REJECTED",
  "reason": "INSUFFICIENT_VOTES",  // or "SELF_CLAIM", "TIMEOUT"
  "claimerName": "Alice",
  "buzzword": "Synergy",
  "message": "Not enough people heard \"Synergy\"",
  "penalty": -50  // only for SELF_CLAIM
}
```

#### Bingo Achieved
Player achieved bingo and won the round.

```json
{
  "type": "BINGO_ACHIEVED",
  "winner": "Alice",
  "score": 520,
  "pattern": [0, 1, 2, 3, 4],  // winning squares
  "message": "🎉 Alice got BINGO! New cards in 3 seconds..."
}
```

#### New Board
New board generated for this player.

```json
{
  "type": "NEW_BOARD",
  "board": ["Deep Dive", "Circle Back", "Touch Base", "FREE SPACE", ...],
  "totalScore": 520,
  "currentScore": 0,
  "roundNumber": 3
}
```

#### New Round
New round started for all players.

```json
{
  "type": "NEW_ROUND",
  "roundNumber": 3,
  "leaderboard": [
    {
      "name": "Alice",
      "totalScore": 520,
      "currentScore": 0
    },
    {
      "name": "Bob",
      "totalScore": 280,
      "currentScore": 0
    }
  ]
}
```

#### Error
Server error or invalid message.

```json
{
  "type": "ERROR",
  "message": "Invalid message format",
  "timestamp": 1704067200000
}
```

#### Pong
Response to ping message.

```json
{
  "type": "PONG",
  "timestamp": 1704067200000
}
```

## Rate Limits

- **30 messages per minute** per player
- **10 players maximum** per room
- **3 pending verifications maximum** per player
- **30 second timeout** for verification voting

## Error Handling

All API endpoints return structured error responses:

```json
{
  "error": "Error description"
}
```

WebSocket errors are sent as `ERROR` messages with details in the `message` field.

## Data Validation

### Room Names
- 1-50 characters
- HTML tags stripped
- Special characters sanitized

### Player Names  
- 1-30 characters
- HTML tags stripped
- Special characters sanitized

### Room Codes
- Exactly 6 characters
- Alphanumeric uppercase only (A-Z, 0-9)
- Generated using cryptographically secure randomization

## Buzzword Library

414 corporate buzzwords across categories:
- Classic Corporate Speak (20 terms)
- Meeting & Communication Gems (24 terms)
- Meeting Theater & Corporate Comedy (20 terms)
- Virtual Meeting Comedy Gold (47 terms)
- Corporate Speak Poetry & Fluff (16 terms)
- Absurd Corporate Priorities (20 terms)
- And 8 more categories with 267+ additional terms

Each player receives a unique 5x5 board (24 buzzwords + 1 FREE SPACE in center) using Fisher-Yates shuffle algorithm for proper randomization.