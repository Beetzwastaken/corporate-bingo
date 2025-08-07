# Deployment Guide

Complete deployment guide for Corporate Buzzword Bingo multiplayer system.

## Prerequisites

### Development Tools
- **Node.js**: v18+ (required for Wrangler)
- **npm**: v8+ (package management)
- **Git**: Version control
- **Cloudflare Account**: For Workers deployment
- **Netlify Account**: For frontend deployment (optional)

### Accounts & Services
1. **Cloudflare Account** with Workers enabled
2. **Domain** (optional, can use workers.dev subdomain)
3. **Netlify Account** (optional, alternative deployment options available)

## Local Development Setup

### 1. Repository Setup
```bash
# Clone repository
git clone https://github.com/your-username/engineer-memes.git
cd engineer-memes

# Install dependencies
npm install
```

### 2. Cloudflare Workers Setup
```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Initialize project (if not already done)
wrangler init
```

### 3. Configuration Files

#### `wrangler.toml`
```toml
name = "buzzword-bingo"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production]
name = "buzzword-bingo-prod"

[[durable_objects.bindings]]
name = "ROOMS"
class_name = "BingoRoom"

[[env.production.durable_objects.bindings]]
name = "ROOMS"
class_name = "BingoRoom"

[env.production.vars]
CORS_ORIGIN = "https://your-domain.com"
```

#### `.env` (create for local development)
```bash
CORS_ORIGIN=http://localhost:5175
```

### 4. Start Development Servers

#### Backend (Terminal 1)
```bash
# Start Cloudflare Workers dev server
npx wrangler dev --port 8787

# Expected output:
# ⎔ Starting local server...
# [wrangler:info] Ready on http://127.0.0.1:8787
```

#### Frontend (Terminal 2)  
```bash
# Start Vite development server
npx vite --port 5175

# Expected output:
# ➜  Local:   http://localhost:5175/
# ➜  Network: use --host to expose
```

### 5. Verify Local Setup
```bash
# Test backend health
curl http://localhost:8787/api/test

# Expected response:
# {"message":"API is working","buzzwordCount":414}

# Test room creation
curl -X POST "http://localhost:8787/api/room/create" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5175" \
  -d '{"roomName": "Test Room", "playerName": "Developer"}'

# Expected response:
# {"success":true,"roomCode":"ABC123",...}
```

## Production Deployment

### Backend Deployment (Cloudflare Workers)

#### 1. Configure Production Environment
```bash
# Set production environment variables
wrangler secret put CORS_ORIGIN --env production
# Enter: https://your-production-domain.com

# Or update wrangler.toml with production vars
```

#### 2. Deploy to Cloudflare Workers
```bash
# Deploy to production
wrangler deploy --env production

# Expected output:
# ✨ Success! Uploaded 1 files (X.XX sec)
# ✨ Your worker has been published
# ✨ https://buzzword-bingo-prod.your-subdomain.workers.dev
```

#### 3. Configure Custom Domain (Optional)
```bash
# Add custom domain via Cloudflare dashboard or CLI
wrangler custom-domain add api.your-domain.com --env production
```

### Frontend Deployment Options

#### Option 1: Netlify (Recommended)

1. **GitHub Integration**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Netlify Configuration**
   - Connect repository to Netlify
   - Build command: `echo "Static site - no build needed"`
   - Publish directory: `dist`
   - Environment variables: None needed

3. **Update API Base URL**
   ```javascript
   // In dist/index.html, update API_BASE
   const API_BASE = 'https://your-worker-domain.workers.dev';
   ```

4. **Deploy**
   - Automatic deployment on git push
   - Custom domain available in Netlify settings

#### Option 2: Cloudflare Pages

1. **Pages Setup**
   ```bash
   # Connect repository to Cloudflare Pages
   # Build command: (none)
   # Output directory: dist
   ```

2. **Environment Variables**
   ```bash
   # Set in Cloudflare Pages dashboard
   API_BASE=https://your-worker-domain.workers.dev
   ```

#### Option 3: GitHub Pages

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Update API Base URL
           run: |
             sed -i 's|http://localhost:8787|https://your-worker.workers.dev|g' dist/index.html
             
         - name: Deploy to Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

#### Option 4: Static File Server

1. **Update Configuration**
   ```javascript
   // Update API_BASE in dist/index.html
   const API_BASE = 'https://your-worker-domain.workers.dev';
   ```

2. **Deploy to any static host**
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Static Web Apps
   - Vercel
   - Any web server

## Environment Configuration

### Development Environment
```javascript
// Local development settings
const API_BASE = 'http://localhost:8787';

// CORS origins in worker.js
const allowedOrigins = [
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:8080'
];
```

### Production Environment
```javascript
// Production settings
const API_BASE = 'https://buzzword-bingo-prod.your-subdomain.workers.dev';

// CORS origins in worker.js (update for production)
const allowedOrigins = [
  'https://your-domain.com',
  'https://your-netlify-app.netlify.app'
];
```

## Security Configuration

### 1. CORS Configuration
Update `worker.js` with your production domains:
```javascript
function corsHeaders(origin) {
  const allowedOrigins = [
    'https://your-production-domain.com',
    'https://your-netlify-app.netlify.app',
    'https://your-backup-domain.com'
  ];
  // ... rest of CORS logic
}
```

### 2. Content Security Policy (Optional)
Add to HTML head:
```html
<meta http-equiv="Content-Security-Policy" 
      content="connect-src 'self' https://your-worker-domain.workers.dev wss://your-worker-domain.workers.dev">
```

### 3. Rate Limiting Configuration
Adjust in `worker.js` if needed:
```javascript
// Current limits
this.MAX_MESSAGES_PER_MINUTE = 30;
this.MAX_PENDING_VERIFICATIONS_PER_PLAYER = 3;
// Room capacity: 10 players
```

## Monitoring & Maintenance

### 1. Cloudflare Workers Analytics
- Access via Cloudflare dashboard
- Monitor request volume, errors, latency
- Set up alerts for high error rates

### 2. Application Logs
```bash
# View live logs during development
wrangler tail --env production

# Example log output:
# [2025-01-15T10:30:00.000Z] Room ABC123 created by Alice
# [2025-01-15T10:30:05.000Z] Bob joined room ABC123
# [2025-01-15T10:30:10.000Z] Verification request for "Synergy"
```

### 3. Health Monitoring
Set up external monitoring for:
- `GET /api/test` endpoint
- Response time monitoring
- Uptime tracking
- Error rate alerts

### 4. Cost Monitoring
Cloudflare Workers pricing:
- **Free tier**: 100,000 requests/day
- **Paid tier**: $5/month for 10M requests
- **Durable Objects**: $0.15 per million requests

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```
Error: CORS policy blocked
```
**Solution**: Add your domain to `allowedOrigins` in `worker.js`

#### 2. WebSocket Connection Failed
```
WebSocket connection failed
```
**Solutions**:
- Check if WebSocket URL is correct
- Verify CORS configuration
- Ensure Durable Objects are enabled

#### 3. Room Creation Fails
```
{"error":"Internal server error"}
```
**Solutions**:
- Check Wrangler deployment status
- Verify `wrangler.toml` configuration
- Check Cloudflare Workers logs

#### 4. Frontend Not Loading
- Verify API_BASE URL is correct
- Check browser developer console for errors
- Ensure static files are deployed correctly

### Development Debug Mode
Enable debug logging:
```javascript
// Add to frontend
const DEBUG = true;
if (DEBUG) console.log('Debug info:', data);

// View Cloudflare Workers logs
wrangler tail --env production
```

## Rollback Procedure

### Backend Rollback
```bash
# List recent deployments
wrangler deployments list --env production

# Rollback to previous version
wrangler rollback --env production
```

### Frontend Rollback
```bash
# Git rollback
git revert <commit-hash>
git push origin main

# Or restore from backup
# (depends on deployment method)
```

## Performance Optimization

### 1. Cloudflare Workers Optimization
- Use `env.ROOMS.idFromName()` for consistent routing
- Implement proper cleanup for memory management
- Use `Map` objects for O(1) lookups
- Minimize durable object storage operations

### 2. Frontend Optimization
- Enable gzip compression on static host
- Use CDN for global distribution
- Minimize WebSocket message size
- Implement connection pooling/retry logic

### 3. Network Optimization
- Use Cloudflare's global edge network
- Enable HTTP/2 and HTTP/3
- Optimize WebSocket payload size
- Implement client-side caching for static assets

## Scaling Considerations

### Current Limits
- **10 players per room** (configurable)
- **Unlimited concurrent rooms** (Durable Objects auto-scale)
- **Global edge deployment** via Cloudflare
- **30 messages/minute per player** rate limiting

### Scaling Up
- Increase room player limits in code
- Adjust rate limits based on usage
- Monitor Cloudflare Workers costs
- Consider implementing room archiving for long-term storage

This deployment guide covers all aspects of getting Corporate Buzzword Bingo running in production with proper security, monitoring, and maintenance procedures.