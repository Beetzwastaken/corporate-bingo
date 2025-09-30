# Corporate Bingo

> **✅ LIVE & FULLY FUNCTIONAL** - Real-time multiplayer bingo game for corporate meetings. Turn "synergy" and "paradigm shifts" into interactive entertainment with your team!

## 🌐 Live Application

🚀 **[https://corporate-bingo-ai.netlify.app](https://corporate-bingo-ai.netlify.app)**

**Current Status**: Production Ready | Advanced Scoring System | Streamlined 4-Char Room Codes | v1.5.0

## 🎮 Features

### **Real Multiplayer Game**
- **Room-based gameplay**: Create or join rooms with 4-character codes (e.g., A4B7, X9K2)
- **Unique boards per player**: Each person gets different buzzwords (171 terms)
- **HTTP Polling Backup**: Reliable multiplayer sync even with SSL issues
- **Real-time updates**: Player lists and room status sync every 3 seconds
- **Anti-cheat detection**: Players can't claim words they said themselves
- **Auto-reshuffle**: New boards generated after each bingo win

### **Corporate Comedy Gold**
- **171 Buzzwords**: Professionally curated collection of corporate speak, meeting theater, virtual call chaos
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
3. Share the 4-character room code with teammates
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
- **worker.js**: Optimized main API router (18KB, reduced from 77KB)
- **analytics-worker.js**: Separate analytics service with dedicated Durable Object
- **BingoRoom**: Durable Object managing individual game rooms
- **DashboardAnalytics**: Dedicated analytics Durable Object for performance metrics
- **HTTP Polling**: Fallback API endpoints for multiplayer sync
- **Security**: CORS, input validation, rate limiting, memory management
- **Real-time**: WebSocket primary + HTTP polling backup
- **Architecture**: Dual-service separation with graceful fallback handling

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
- **Backend**: Dual Cloudflare Workers deployment (main + analytics services)
- **Main Worker**: Core game functionality (`npx wrangler deploy`)
- **Analytics Worker**: Separate performance analytics service
- **Frontend**: Netlify (automatic from `main` branch via GitHub Actions)
- **SSL Proxy**: Netlify redirects handle SSL issues with Cloudflare Workers
- **Production URL**: https://corporate-bingo-ai.netlify.app
- **Health Endpoints**: Backward compatible (/health + /api/health)

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

*...and many more ridiculous corporate terms for quality entertainment!*

## 🛠️ Technical Implementation

Built with professional-grade architecture and modern development practices:

### **Reliability & Performance**
- **Hybrid Connectivity**: WebSocket primary with HTTP polling backup (every 3s)
- **Backend Optimization**: 76% bundle size reduction (77KB → 18KB)
- **Service Architecture**: Separated analytics for improved performance
- **Mobile-First Design**: Responsive with touch-optimized sliding sidebar
- **TypeScript Strict Mode**: Comprehensive type safety and error prevention
- **Input validation**: Comprehensive sanitization and validation
- **Rate limiting**: 30 messages per minute per player
- **Memory management**: Automatic cleanup on disconnect
- **Graceful Degradation**: Analytics service fallback with error handling

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

- **Advanced scoring system (v1.5.0)**: Consecutive square bonuses (3-in-row: +1, 4-in-row: +3, BINGO: +5) with smart tracking
- **Streamlined room codes (v1.5.0)**: Simple 4-character alphanumeric codes (A4B7, X9K2) replace prefixed format
- **Score persistence (v1.5.0)**: Solo scores maintained through multiple BINGOs with manual reset option
- **Critical bug fixes (v1.5.0)**: 5 major fixes for bonus stacking, consecutive detection, and score calculations
### ✅ Latest Fixes (September 2025)
- **Backend optimization (v1.4.0)**: 76% bundle size reduction with analytics service separation
- **Production compatibility**: Backward-compatible health endpoints for zero-downtime deployment
- **Service architecture**: Extracted analytics to dedicated Durable Object for performance
- **Error handling**: Comprehensive graceful fallback systems and rollback procedures
- **Multiplayer synchronization**: HTTP polling backup ensures players see each other
- **Mobile sidebar improvements**: Touch-friendly close with overlay and X button  
- **TypeScript strict compliance**: All linting errors resolved for reliable deployments
- **SSL resilience**: Hybrid WebSocket + HTTP polling handles Cloudflare SSL issues
- **Production stability**: Comprehensive testing and quality assurance

### 🚀 Version History
- **v1.5.0** - Advanced scoring system with consecutive square bonuses + Streamlined 4-character room codes + 5 critical bug fixes
- **v1.4.0** - Backend optimization + Analytics service separation (76% bundle reduction)
- **v1.3.0** - Multiplayer reliability + Mobile UX improvements
- **v1.2.0** - React 19 + TypeScript migration + Apple design
- **v1.1.0** - Real-time multiplayer with Durable Objects
- **v1.0.0** - Initial release with 171 professionally curated buzzwords

---

**🚀 Professional Meeting Entertainment Since 2025 • Real Multiplayer • Backend Optimized • Mobile Optimized • Claude Code Enhanced • v1.5.0**
