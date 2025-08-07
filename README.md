# Corporate Bingo

Real multiplayer bingo game for corporate meetings. Turn "synergy" and "paradigm shifts" into fun with your team!

## Live Site

🚀 **[https://corporate-bingo-ai.netlify.app](https://corporate-bingo-ai.netlify.app)**

## 🎮 Features

### **Real Multiplayer Game**
- **Room-based gameplay**: Create or join rooms with 6-character codes
- **Unique boards per player**: Each person gets different buzzwords (414+ terms)
- **Real-time verification**: Democratic voting system for claimed squares
- **Anti-cheat detection**: Players can't claim words they said themselves
- **Auto-reshuffle**: New boards generated after each bingo win

### **Corporate Comedy Gold**
- **414+ Buzzwords**: Classic corporate speak, meeting theater, virtual call chaos
- **Meeting-focused**: "You're Muted", "Can You See My Screen?", "Let's Take This Offline"
- **Humor over technical**: Funny corporate terms rather than engineering jargon

### **Professional Architecture**
- **Cloudflare Workers**: Serverless backend with global edge deployment
- **Durable Objects**: Persistent real-time game state management
- **WebSocket communication**: Instant updates across all players
- **Security hardening**: Input validation, rate limiting, memory management

## 🚀 Quick Start

### **Host a Game**
1. Enter your name and room name
2. Click "Create Room" 
3. Share the 6-character room code with teammates
4. Start your meeting and play during corporate speak!

### **Join a Game**
1. Get the room code from your host
2. Enter your name and the room code
3. Click "Join Room"
4. Get your unique bingo board and start playing!

## 🎯 How to Play

1. **During your meeting**: Listen for buzzwords on your board
2. **Claim squares**: Click when you hear a buzzword
3. **Vote to verify**: Other players vote on whether the word was really said
4. **Anti-cheat**: Can't claim words you said yourself (-50 points penalty!)
5. **Get BINGO**: First to complete a line wins the round
6. **New round**: Everyone gets fresh boards automatically

## 🏗️ Architecture

### **Backend (Cloudflare Workers)**
- **worker.js**: Main API router and request handler
- **BingoRoom**: Durable Object managing individual game rooms
- **Security**: CORS, input validation, rate limiting
- **Real-time**: WebSocket connections for instant updates

### **Frontend (Vanilla JavaScript)**
- **Single-page application**: All functionality in one HTML file
- **WebSocket client**: Real-time communication with backend
- **Responsive design**: Works on desktop, tablet, and mobile
- **Local storage**: Preserves user preferences and stats

## 🔧 Development

### **Local Development**
```bash
# Start backend (Cloudflare Workers)
npx wrangler dev --port 8787

# Start frontend (Vite)
npx vite --port 5175
```

### **Deployment**
- **Backend**: Cloudflare Workers (`wrangler deploy`)
- **Frontend**: Netlify (automatic from `main` branch)

## 🔥 Buzzword Categories

### **Meeting Theater**
"Let's Take This Offline", "We Need to Socialize This", "Run it by Legal", "Circle Back on Monday"

### **Virtual Call Chaos**  
"You're Muted", "Can Everyone See My Screen?", "Sorry, I Was Muted", "Dog is Barking"

### **Corporate Speak Poetry**
"At the End of the Day", "To Be Completely Transparent", "Moving Forward", "Net-Net"

### **Consultant Word Salad**
"Value Creation", "Thought Leadership", "ROI Analysis", "Competitive Advantage"

### **People & Culture Comedy**
"Culture Fit", "Self-starter", "Go-getter", "Servant Leader", "Executive Presence"

*...and 300+ more ridiculous corporate terms!*

## 🛠️ Technical Implementation

Built with professional-grade architecture:

### **Security & Performance**
- **Input validation**: Comprehensive sanitization and validation
- **Rate limiting**: 30 messages per minute per player
- **Memory management**: Automatic cleanup on disconnect
- **Race condition prevention**: Atomic operations and timeout handling

### **Real-time Features**
- **WebSocket communication**: Instant updates across all players
- **Democratic verification**: Majority voting system with anti-cheat
- **Auto-reshuffle**: New boards generated after wins
- **Session management**: Persistent game state with Durable Objects

### **Development Tools**
- **Model Context Protocol (MCP)**: Advanced development workflows
- **Agent-based testing**: Automated quality assurance
- **Claude Code optimization**: AI-enhanced development process

## 🎉 Corporate Comedy

Made with 😅 by developers who've survived too many "synergistic deep dives". Because sometimes you need to gamify the pain to keep from crying during that fourth "all hands" of the week.

*Turn your next standup into a game show!*

---

**🚀 Professional Meeting Entertainment Since 2025 • Real Multiplayer • Claude Code Optimized • v1.2-deploy-test**
