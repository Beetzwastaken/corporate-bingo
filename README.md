# Corporate Bingo

> **✅ LIVE & FULLY FUNCTIONAL** - Real-time multiplayer bingo game for corporate meetings. Turn "synergy" and "paradigm shifts" into interactive entertainment with your team!

## 🌐 Live Application

🚀 **[https://corporate-bingo-ai.netlify.app](https://corporate-bingo-ai.netlify.app)**

**Current Status**: Production Ready | Multiplayer Working | Mobile Optimized

## 🎮 Features

### **Real Multiplayer Game**
- **Room-based gameplay**: Create or join rooms with 6-character codes
- **Unique boards per player**: Each person gets different buzzwords (369+ terms)
- **HTTP Polling Backup**: Reliable multiplayer sync even with SSL issues
- **Real-time updates**: Player lists and room status sync every 3 seconds
- **Anti-cheat detection**: Players can't claim words they said themselves
- **Auto-reshuffle**: New boards generated after each bingo win

### **Corporate Comedy Gold**
- **369+ Buzzwords**: Enhanced collection of corporate speak, meeting theater, virtual call chaos
- **Meeting-focused**: "You're Muted", "Can You See My Screen?", "Let's Take This Offline"
- **Humor over technical**: Funny corporate terms rather than engineering jargon
- **Curated content**: Professional appropriateness with maximum humor impact

### **Professional Architecture**
- **React 19 + TypeScript**: Modern frontend with strict type safety
- **Cloudflare Workers**: Serverless backend with global edge deployment
- **Durable Objects**: Persistent real-time game state management
- **Hybrid connectivity**: WebSocket primary + HTTP polling fallback
- **Mobile optimized**: Responsive design with touch-friendly interactions
- **Security hardening**: Input validation, rate limiting, memory management

## 🚀 Quick Start

### **Solo Play** (Instant Start)
1. Visit the site - ready to play immediately!
2. Start clicking squares as you hear buzzwords
3. Get BINGO and generate a fresh board

### **Host a Multiplayer Game**
1. Click "Rooms" → Enter your name and room name
2. Click "Create Room" 
3. Share the 6-character room code with teammates
4. Start your meeting and play during corporate speak!

### **Join a Multiplayer Game**
1. Get the room code from your host
2. Click "Rooms" → Enter your name and the room code
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

### **Backend (Cloudflare Workers + Durable Objects)**
- **worker.js**: Main API router and request handler (1000+ lines)
- **BingoRoom**: Durable Object managing individual game rooms
- **HTTP Polling**: Fallback API endpoints for multiplayer sync
- **Security**: CORS, input validation, rate limiting, memory management
- **Real-time**: WebSocket primary + HTTP polling backup

### **Frontend (React 19 + TypeScript)**
- **Modern SPA**: React 19.1.0 with TypeScript 5.8.3
- **Zustand State Management**: Centralized game state with persistence
- **Hybrid Connectivity**: WebSocket + HTTP polling for reliable multiplayer
- **Mobile Responsive**: Touch-friendly with sliding sidebar
- **Apple-inspired Design**: Dark theme with professional polish
- **Build System**: Vite 7.0.6 with ESLint and Tailwind CSS

## 🔧 Development

### **Local Development**
```bash
# Clone repository
git clone https://github.com/Beetzwastaken/corporate-bingo.git
cd corporate-bingo

# Install dependencies
npm install

# Start frontend development server
npm run dev
# Runs on http://localhost:5175

# Start backend (separate terminal)
npx wrangler dev --port 8787
# Runs on http://localhost:8787

# Run tests
npm run test
npm run lint
```

### **Deployment**
- **Backend**: Cloudflare Workers (`npx wrangler deploy`)
- **Frontend**: Netlify (automatic from `main` branch via GitHub Actions)
- **SSL Proxy**: Netlify redirects handle SSL issues with Cloudflare Workers
- **Production URL**: https://corporate-bingo-ai.netlify.app

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

*...and 350+ more ridiculous corporate terms!*

## 🛠️ Technical Implementation

Built with professional-grade architecture and modern development practices:

### **Reliability & Performance**
- **Hybrid Connectivity**: WebSocket primary with HTTP polling backup (every 3s)
- **Mobile-First Design**: Responsive with touch-optimized sliding sidebar
- **TypeScript Strict Mode**: Comprehensive type safety and error prevention
- **Input validation**: Comprehensive sanitization and validation
- **Rate limiting**: 30 messages per minute per player
- **Memory management**: Automatic cleanup on disconnect

### **Real-time Features**
- **WebSocket communication**: Instant updates across all players
- **HTTP Polling Fallback**: Ensures multiplayer works even with SSL issues
- **Player Synchronization**: Real-time player lists and room status
- **Session management**: Persistent game state with Durable Objects
- **Auto-reshuffle**: New boards generated after wins

### **Development Excellence**
- **Model Context Protocol (MCP)**: Advanced development workflows with OpenCV and Excel integrations
- **Agent-based development**: Specialized AI agents for frontend, backend, and QA
- **Claude Code optimization**: AI-enhanced development process
- **Comprehensive testing**: Unit, integration, and E2E testing suites
- **Professional documentation**: Complete project handoffs and architecture docs

## 🎉 Corporate Comedy

Made with 😅 by developers who've survived too many "synergistic deep dives". Because sometimes you need to gamify the pain to keep from crying during that fourth "all hands" of the week.

*Turn your next standup into a game show!*

---

## 📋 Recent Updates

### ✅ Latest Fixes (January 2025)
- **Multiplayer synchronization fixed**: HTTP polling backup ensures players see each other
- **Mobile sidebar improvements**: Touch-friendly close with overlay and X button  
- **TypeScript strict compliance**: All linting errors resolved for reliable deployments
- **SSL resilience**: Hybrid WebSocket + HTTP polling handles Cloudflare SSL issues
- **Production stability**: Comprehensive testing and quality assurance
- **Star positioning centered**: FREE SPACE star perfectly centered across all breakpoints
- **Mobile responsiveness enhanced**: Improved screen space utilization and touch targets
- **Buzzword consolidation**: Single source of truth with 369+ curated terms

### 🚀 Version History
- **v1.3.0** - Multiplayer reliability + Mobile UX improvements
- **v1.2.0** - React 19 + TypeScript migration + Apple design
- **v1.1.0** - Real-time multiplayer with Durable Objects
- **v1.0.0** - Initial release with 369+ buzzwords

---

**🚀 Professional Meeting Entertainment Since 2025 • Real Multiplayer • Mobile Optimized • Claude Code Enhanced • v1.3.0**
