# Netlify Platform Configuration Guide

## Overview
This document outlines the required platform configuration steps in the Netlify UI to ensure proper deployment and eliminate caching conflicts for the Corporate Bingo project.

## Critical Configuration Requirements

### 1. Site Settings Configuration

**Build Settings:**
- Build command: `npm run build` (already configured in netlify.toml)
- Publish directory: `dist` (already configured in netlify.toml)
- Functions directory: `netlify/functions` (already configured in netlify.toml)

**Node.js Version:**
- Set to `20` (already configured in netlify.toml)

### 2. Environment Variables
The following environment variables are automatically set via netlify.toml:
- `NODE_VERSION = "20"`
- `VITE_API_URL = "https://corporate-bingo.workers.dev"`  
- `VITE_WS_URL = "wss://corporate-bingo.workers.dev"`

### 3. Required GitHub Repository Secrets

**In GitHub Repository Settings > Secrets and Variables > Actions:**

1. **NETLIFY_AUTH_TOKEN**
   - Go to Netlify Dashboard > User Settings > Applications
   - Generate a new personal access token
   - Add as GitHub secret with name `NETLIFY_AUTH_TOKEN`

2. **NETLIFY_SITE_ID**
   - Found in Netlify site dashboard: Site configuration > General
   - API ID value (e.g., `14999af9-ca36-4925-9aeb-e21e279d54a1`)
   - Add as GitHub secret with name `NETLIFY_SITE_ID`

3. **GITHUB_TOKEN** 
   - Automatically provided by GitHub Actions (no manual setup required)

### 4. Deploy Settings in Netlify UI

**Branch Deploys:**
- Production branch: `main`
- Deploy only production branch (disable branch deploys for other branches)

**Deploy Contexts:**
- Production: Automatic deploys from `main` branch via GitHub Actions only
- **IMPORTANT: Disable manual deploys to prevent conflicts with GitHub Actions**

**Deploy Hooks:**
- Remove or disable any existing deploy hooks that might trigger manual deployments

### 5. Headers Configuration Verification

The netlify.toml file contains comprehensive header configuration:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss://corporate-bingo.workers.dev https://corporate-bingo.workers.dev; img-src 'self' data:; font-src 'self'"
    Cache-Control = "no-cache, max-age=0, must-revalidate"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/vite.svg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

**Verify in Netlify UI:**
- Go to Site settings > Headers and redirects
- Ensure no conflicting headers are set in the UI that override netlify.toml
- Remove any manually configured headers that conflict with the TOML configuration

### 6. Redirects Configuration Verification

The netlify.toml includes SPA redirect rules:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Verify in Netlify UI:**
- Go to Site settings > Headers and redirects
- Ensure no conflicting redirect rules exist that override the TOML configuration

### 7. Post-Deployment Cache Invalidation

**Manual Cache Clearing:**
If users still see old content after deployment:
1. Go to Netlify site dashboard
2. Click "Site overview"  
3. Under "Production deploys" click the latest deploy
4. Click "Options" > "Clear cache and deploy site"

**Automated Cache Headers:**
The netlify.toml is configured with proper cache headers:
- HTML files: `no-cache, no-store, must-revalidate`
- Assets: `max-age=31536000, immutable` (1 year with immutable flag)
- General content: `no-cache, max-age=0, must-revalidate`

## Implementation Checklist

### Pre-Deployment
- [ ] Verify NETLIFY_AUTH_TOKEN is set in GitHub Secrets
- [ ] Verify NETLIFY_SITE_ID is set in GitHub Secrets  
- [ ] Confirm only one netlify.toml exists (remove duplicates from .netlify/ directory)
- [ ] Disable manual deploys in Netlify UI
- [ ] Remove conflicting headers/redirects from Netlify UI

### Post-Deployment  
- [ ] Verify GitHub Actions deployment succeeds
- [ ] Test cache behavior with browser dev tools
- [ ] Confirm no 404 errors on SPA routes
- [ ] Validate security headers are applied correctly

## Troubleshooting

**Issue: Manual deploys override GitHub Actions**
- Solution: Disable automatic Git Gateway deploys in Netlify UI
- Ensure only GitHub Actions workflow triggers deployments

**Issue: Browser caching prevents updates**  
- Solution: Verify Cache-Control headers are applied correctly
- Use "Clear cache and deploy" in Netlify if needed
- Remove duplicate/conflicting .netlify/netlify.toml files

**Issue: SPA routing returns 404**
- Solution: Verify redirect rule in netlify.toml is not overridden by UI settings

**Issue: GitHub Actions deployment fails**
- Solution: Check NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID secrets are correctly configured

## Security Considerations

The configuration includes comprehensive security headers:
- CSRF protection via X-Frame-Options 
- XSS protection
- Content type sniffing protection
- Strict referrer policy
- Content Security Policy restricting resource origins

All headers are configured via netlify.toml to ensure consistency and prevent manual override conflicts.

---
*Last Updated: August 2025*
*Configuration Version: 1.0*