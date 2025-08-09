# Corporate Bingo Project Context

**Project Type**: Corporate Humor Web Application  
**Current Status**: ✅ PRODUCTION READY - Advanced Multiplayer Platform  
**Live URL**: https://corporate-bingo-ai.netlify.app  
**Last Updated**: January 8, 2025

## 🚨 MANDATORY: ALWAYS USE SPECIALIZED AGENTS 🚨
**NEVER work directly on Corporate Bingo tasks - Always delegate to specialized agents first**

### Required Agent Delegation:
- **Frontend/React/TypeScript** → Frontend Developer Agent via Task tool
- **Backend/worker.js/API/WebSocket** → Backend Developer Agent via Task tool  
- **Testing/QA/Screenshots/Validation** → QA Engineer Agent via Task tool
- **Multi-step workflows/Coordination** → Project Manager Agent via Task tool
- **Content/Visual/Corporate Humor** → Content Manager Agent via Task tool
- **Deployment/Infrastructure** → DevOps Agent via Task tool

### Agent Auto-Activation Rules:
- ANY React component updates → Frontend Developer Agent
- ANY worker.js modifications → Backend Developer Agent
- ANY testing or validation → QA Engineer Agent
- ANY multi-step task coordination → Project Manager Agent
- ALL tasks require Task tool delegation before direct work

## Available Specialized Agents
@include docs/reports/agent_task_briefs.md

### Agent Collaboration Standards
- 95%+ autonomous agent operation expected
- TodoWrite integration for progress tracking
- Cross-agent dependency resolution via Project Manager
- Professional engineering standards (95%+ compliance)

## Project Overview

**Corporate Bingo & Buzzword Entertainment Platform** - A sophisticated real-time multiplayer web application that transforms corporate meetings into interactive entertainment. Features professional-grade architecture with 369+ curated buzzwords, comprehensive scoring system, and advanced room management for authentic corporate humor.

**Core Features**: 
- **Real-time Multiplayer Bingo**: Room-based gameplay with unique boards per player
- **Advanced Scoring System**: Live points tracking with animations and leaderboards
- **Multi-Room Support**: Users can join multiple rooms simultaneously with tab navigation
- **Dual Room Types**: Single meeting rooms (auto-expire) and persistent team rooms
- **Corporate Humor Focus**: Meeting-oriented buzzwords and corporate humor
- **Professional Architecture**: Enterprise-grade security and performance

## Technology Stack

- **Frontend**: React 19.1.0, TypeScript, Vite 7.0.4, Tailwind CSS 4.1.11
- **State Management**: Zustand 5.0.7 (4 focused store modules)
- **Backend**: Cloudflare Workers, Durable Objects, WebSocket real-time communication
- **Development**: ESLint 9.30.1, TypeScript 5.8.3, PostCSS, Autoprefixer
- **Deployment**: Netlify (frontend), Cloudflare Workers (backend)

## Essential Commands

### Development
- `npm run dev` - Start Vite development server (port 5175)
- `npx wrangler dev --port 8787` - Local Cloudflare Workers development

### Quality & Build
- `npm run build` - TypeScript compilation + Vite production build
- `npm run lint` - ESLint validation with TypeScript rules
- `npm run preview` - Test production build locally

### Deployment
- `npx wrangler deploy` - Deploy to Cloudflare Workers production
- **Frontend**: Automatic via Netlify Git integration on push to main

## File Structure

### Frontend Source (`/src/`)
- `App.tsx` - Main single-page application with sidebar and toast system
- `components/bingo/` - BingoCard, RoomManager, Leaderboard, ScoreDisplay components
- `components/shared/` - ToastNotification system for scoring feedback
- `stores/` - Zustand stores (connectionStore, gameStore, roomStore, playerStore, multiRoomStore)
- `lib/` - WebSocket, polling, and game engine utilities
- `types/` - TypeScript interfaces
- `data/buzzwords.ts` - Single source of truth for all 369+ buzzwords

### Backend & Configuration
- `worker.js` - Complete multiplayer backend (1037 lines, 369+ buzzwords)
- `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`
- `netlify.toml` - Proxy setup, `wrangler.toml` - Cloudflare config
- `/dist/` - Build output directory

### Documentation & Testing
- `/docs/` - Project plans, handoffs, architecture documentation
- `/testing/` - Screenshots, research data, validation files
- `/testing/screenshots/` - UI testing and visual validation assets

## System Configuration

**Platform**: Windows  
**Path Format**: ALWAYS use forward slashes (`F:/CC/Projects/Corporate Bingo/`) and quote paths with spaces  
**Bash Commands**: Use `F:/path/` format, never `F:\path\` or `F:path`

### File Path Requirements
- **Screenshots**: MUST save to `F:/CC/Projects/Corporate Bingo/testing/screenshots/`
- **Project Root**: `F:/CC/Projects/Corporate Bingo/`
- **Test before operations**: `ls "F:/CC/Projects/Corporate Bingo/"`

## MANDATORY Agent-Enhanced Development Workflow

### Required Agent Activation Patterns
**All development work must use these patterns - direct work is prohibited:**

- **Frontend Issues**: `Task(subagent_type: "general-purpose", prompt: "Use Frontend Developer Agent expertise for...")` - React/TypeScript UI, responsive design, component fixes
- **Backend Issues**: `Task(subagent_type: "general-purpose", prompt: "Use Backend Developer Agent expertise for...")` - WebSocket, multiplayer sync, performance optimization  
- **Quality Assurance**: `Task(subagent_type: "general-purpose", prompt: "Use QA Engineer Agent expertise for...")` - Comprehensive testing, validation, edge cases
- **Multi-Agent Coordination**: `Task(subagent_type: "general-purpose", prompt: "Use Project Manager Agent for...")` - TodoWrite management, cross-agent coordination
- **Content/Visual**: `Task(subagent_type: "general-purpose", prompt: "Use Content Manager Agent for...")` - Corporate humor, visual standards, presentation
- **Infrastructure**: `Task(subagent_type: "general-purpose", prompt: "Use DevOps Agent for...")` - Deployment, monitoring, infrastructure

### Agent Delegation Success Examples
- **UI/UX Improvements**: Frontend Developer Agent fixed button positioning, star overlays, 3D effects
- **TypeScript Issues**: Backend Developer Agent resolved ESLint errors and type compatibility  
- **Testing & Validation**: QA Engineer Agent performed visual regression testing and performance analysis
- **Cross-Agent Coordination**: Project Manager Agent successfully managed multi-step workflows with TodoWrite

## MCP Server Integration

### Available Tools (Proven in Production)
- **IDE MCP**: `mcp__ide__getDiagnostics`, `mcp__ide__executeCode` - TypeScript diagnostics, live testing
- **OpenCV MCP**: `mcp__opencv__get_image_stats_tool`, `mcp__opencv__resize_image_tool` - UI testing, visual validation
- **Excel VBA MCP**: `mcp__excel__create_workbook`, `mcp__excel__write_excel_data` - Project tracking, analytics
- **SVGMaker MCP**: `mcp__svgmaker__svgmaker_generate` - Logo design, graphics generation

### Practical Usage Patterns
- **Visual Testing**: OpenCV for before/after UI comparisons and responsive design validation
- **Project Management**: Excel VBA for agent coordination dashboards and quality metrics
- **TypeScript Debugging**: IDE MCP for real-time error analysis and code execution
- **Graphics Generation**: SVGMaker for professional UI elements and documentation

## Corporate Humor Domain

### Buzzword Library Strategy (369+ Terms)
- **Meeting-focused humor** over technical accuracy
- **Universal corporate recognition** for broad appeal  
- **Professional appropriateness** for workplace use
- **Viral potential** through relatable corporate experiences

### Primary Categories
- **Classic Corporate Speak**: "Synergy", "Deep Dive", "Circle Back", "Move the Needle"
- **Virtual Meeting Comedy**: "You're Muted", "Can You See My Screen?", "Let's Circle Back Offline"  
- **Meeting Theater**: "Let's Take This Offline", "Run it by Legal", "Touch Base"
- **Consultant Word Salad**: "Value Creation", "Thought Leadership", "Best Practices"
- **People & Culture**: "Culture Fit", "Self-starter", "Servant Leader", "Growth Mindset"

### Game Mechanics
- **WebSocket-based real-time synchronization**
- **Unique 5x5 boards per player** (24 buzzwords + FREE SPACE)
- **Democratic verification system** with majority voting
- **Anti-cheat detection** preventing self-claims
- **Auto-reshuffle** generating new boards after wins
- **Comprehensive Scoring System**: 10 points per square, bonus for lines (50/100), BINGO bonus (200)
- **Real-time Leaderboards**: Live player rankings with crown indicators

## Architecture Highlights

### Real-time Multiplayer
- **Primary**: WebSocket connections via Cloudflare Workers
- **Fallback**: HTTP polling (3-second intervals) for reliability
- **State Management**: Zustand with 5 focused store modules (including multiRoomStore)
- **Performance**: <200ms response time, global edge deployment

### Security & Reliability  
- **Input validation** and comprehensive CORS security
- **Rate limiting** (30 messages/minute) preventing abuse
- **Atomic operations** preventing race conditions
- **Memory management** and connection cleanup

### Professional Polish
- **Apple-inspired dark theme** with professional aesthetics
- **Mobile-first responsive design** with touch optimization
- **Accessibility compliance** with keyboard navigation and screen reader support
- **Performance optimization** with lazy loading and GPU acceleration

## Advanced Features & Components

### Points & Scoring System
**Complete real-time scoring with visual feedback:**

- **ScoreDisplay Component**: Live score counter with floating animations (+10, +50, etc.)
- **Leaderboard Component**: Real-time sorted player rankings with crown emoji (👑) for leaders
- **Toast Notifications**: Animated score change notifications with point values
- **Scoring Logic**: 10 points per verified square, 50/100 bonus for 3/4-in-a-row, 200 for BINGO
- **Anti-cheat Penalties**: -50 points for self-claims with visual feedback

### Room Management System
**Sophisticated multi-room architecture:**

#### Single Meeting Rooms (MTG-XXXX)
- **Purpose**: One-time use for specific meetings or events
- **Expiration**: Auto-expire after 24 hours from creation
- **Cleanup**: Auto-remove after 2 hours of inactivity
- **Use Cases**: Stand-ups, all-hands meetings, workshops, training sessions

#### Persistent Team Rooms (TEAM-XXXX) 
- **Purpose**: Long-running rooms for teams, departments, or ongoing groups
- **Duration**: Never expire automatically
- **Cumulative Scoring**: Maintains total scores across multiple game sessions
- **Leaderboards**: Weekly/monthly performance tracking (framework implemented)
- **Use Cases**: Department teams, project groups, regular meeting attendees

#### Multi-Room Support
- **Simultaneous Participation**: Users can join and actively play in multiple rooms
- **Tab Navigation**: Browser-style tabs for seamless room switching
- **Independent State**: Each room maintains separate game state and player data
- **WebSocket Multiplexing**: Efficient connection management for multiple rooms

### Responsive Design System
**Optimized layouts for all screen sizes:**

#### Desktop Sidebar (≥768px)
- **Compact Room Selector**: iOS-style segmented control (70px height vs 200px+ before)
- **Efficient Space Usage**: Reduced padding, grid layouts, horizontal organization
- **Professional Animations**: Smooth hover states and selection feedback

#### Mobile Interface (<768px)
- **Touch-Friendly Cards**: Large room type selection with 44px+ touch targets
- **Rich Descriptions**: Full feature explanations and visual hierarchy
- **Tab Optimization**: Mobile-responsive room switching with scroll indicators

### Visual Design Elements
**Professional Apple-inspired aesthetic:**

- **New Logo**: CB monogram with grid pattern and cyan accents
- **Dark Theme**: Consistent #0a0a0a backgrounds with #00d4ff accents  
- **Score Animations**: Hardware-accelerated floating point notifications
- **Crown Effects**: Bouncing animation for leaderboard winners
- **Toast System**: Elegant slide-in notifications with progress bars

## Development Best Practices

### Code Style
- **TypeScript strict mode** with comprehensive type checking
- **ESLint compliance** with @typescript-eslint rules
- **2-space indentation** for consistency
- **Component-based architecture** with clear separation of concerns

### Testing & Quality
- **Build validation** before deployment (`npm run build` + `npm run lint`)
- **Visual regression testing** using OpenCV MCP integration
- **Cross-device compatibility** validation across viewports
- **Performance benchmarking** with real-time metrics

### Deployment Pipeline
1. **Push to main branch** triggers automatic deployment
2. **GitHub Actions** runs build and quality checks  
3. **Netlify deployment** for frontend (automatic)
4. **Cloudflare Workers** for backend (manual via `npx wrangler deploy`)
5. **Live validation** at https://corporate-bingo-ai.netlify.app

## CI/CD Configuration & Troubleshooting

### GitHub Actions Build Requirements

**CRITICAL**: The following configuration is required for successful GitHub Actions builds:

#### TypeScript Configuration
- **Compatible Version**: TypeScript ~5.8.3 (avoid experimental flags)
- **Removed Flags** (incompatible with CI):
  - `erasableSyntaxOnly` - TypeScript 5.8+ experimental feature
  - `noUncheckedSideEffectImports` - TypeScript 5.8+ experimental feature
- **Required tsconfig.app.json Settings**:
  ```json
  {
    "include": ["src"]  // NOT ["src", "data"] - data is inside src/
  }
  ```

#### ESLint Configuration
- **Use Standard Flat Config**: ESLint 9+ format
- **Correct Ignores Syntax**:
  ```javascript
  export default tseslint.config([
    { ignores: ['dist', 'src/temp-disabled/**/*', 'tests/**/*'] },
    // ... rest of config
  ])
  ```
- **Invalid Import to Avoid**: `import { globalIgnores } from 'eslint/config'` - This doesn't exist

#### Vite Configuration
- **Use Default Minification**: `minify: true` instead of custom terser options
- **Avoid Complex Terser Config**: Custom terser options can fail in CI environments
- **Working Configuration**:
  ```typescript
  build: {
    minify: true,  // Use defaults for CI compatibility
    cssMinify: true,
    target: 'esnext'
  }
  ```

### Common Build Failures & Solutions

#### Issue 1: Build Fails at "Build application" Step
**Symptoms**: Local build works, GitHub Actions fails after lint/typecheck pass  
**Cause**: TypeScript 5.8+ experimental flags or configuration mismatches  
**Solution**: Remove experimental TypeScript flags, use standard configurations

#### Issue 2: ESLint Import Errors
**Symptoms**: Build fails with module resolution errors  
**Cause**: Invalid ESLint imports or configuration syntax  
**Solution**: Use standard ESLint flat config without experimental imports

#### Issue 3: 403 Errors on Build Logs
**Symptoms**: Cannot access GitHub Actions build logs  
**Cause**: This is usually a red herring - the real issue is the build failure  
**Solution**: Focus on fixing the build configuration, not the log access

### Proven Working Configuration (January 8, 2025)

Successfully fixed GitHub Actions by:
1. Removing TypeScript 5.8+ experimental flags
2. Fixing ESLint configuration to use standard syntax
3. Correcting TypeScript include paths
4. Simplifying Vite terser configuration to defaults

**Key Principle**: Prioritize CI/CD compatibility over cutting-edge features. Use proven, stable configurations.

### Testing Build Fixes

Always test locally before pushing:
```bash
npm run lint        # Must pass
npx tsc --noEmit    # Must pass  
npm run build       # Must pass
```

If all pass locally but fail in CI, check for:
- TypeScript version mismatches
- Node.js version differences
- Configuration flags not supported in CI environment

---

*Corporate Bingo | Professional Corporate Entertainment | Real-time Multiplayer | Claude Code Optimized*