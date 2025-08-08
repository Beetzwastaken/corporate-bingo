# Corporate Bingo Project Context

**Project Type**: Corporate Humor Web Application  
**Current Status**: ✅ PRODUCTION READY - Fully Functional Live Application  
**Live URL**: https://corporate-bingo-ai.netlify.app  
**Last Updated**: January 8, 2025

## Project Overview

**Corporate Bingo & Buzzword Entertainment Platform** - A real-time multiplayer web application that transforms corporate meetings into interactive entertainment. Features professional-grade architecture with 369+ curated buzzwords, democratic verification system, and anti-cheat detection for authentic corporate humor.

**Core Features**: 
- **Real-time Multiplayer Bingo**: Room-based gameplay with unique boards per player
- **Corporate Humor Focus**: Meeting-oriented buzzwords and corporate humor
- **Professional Architecture**: Enterprise-grade security and performance
- **Solo & Multiplayer Modes**: Instant play or room-based social gaming

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
- `App.tsx` - Main single-page application with sidebar
- `components/bingo/` - BingoCard, RoomManager, BingoStats components
- `stores/` - Zustand stores (connectionStore, gameStore, roomStore, playerStore)
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

## Agent-Enhanced Development Workflow

### Proven Agent Activation Patterns
Based on successful implementation experience:

- **Frontend Issues**: `Task(frontend-dev-agent)` - React/TypeScript UI, responsive design, component fixes
- **Backend Issues**: `Task(backend-dev-agent)` - WebSocket, multiplayer sync, performance optimization  
- **Quality Assurance**: `Task(qa-engineer-agent)` - Comprehensive testing, validation, edge cases
- **Multi-Agent Coordination**: Use TodoWrite for progress tracking across agents

### Successful Agent Applications
- **UI/UX Improvements**: Frontend agent fixed button positioning, star overlays, 3D effects
- **TypeScript Issues**: Backend agent resolved ESLint errors and type compatibility  
- **Testing & Validation**: QA agent performed visual regression testing and performance analysis
- **Cross-Agent Coordination**: TodoWrite successfully managed multi-step workflows

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

## Architecture Highlights

### Real-time Multiplayer
- **Primary**: WebSocket connections via Cloudflare Workers
- **Fallback**: HTTP polling (3-second intervals) for reliability
- **State Management**: Zustand with 4 focused store modules
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