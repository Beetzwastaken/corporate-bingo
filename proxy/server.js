import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
app.use(cors({
  origin: [
    'https://corporate-bingo-ai.netlify.app',
    'http://localhost:5180',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    proxy: 'corporate-bingo-backend',
    timestamp: new Date().toISOString()
  });
});

// Proxy configuration
const proxyOptions = {
  target: 'http://corporatebingo.ryanwixon15.workers.dev',
  changeOrigin: true,
  secure: false,
  followRedirects: true,
  timeout: 30000,
  logLevel: 'info',
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    res.status(500).json({
      error: 'Proxy Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying: ${req.method} ${req.url}`);
    
    // Ensure proper headers
    proxyReq.setHeader('Origin', 'https://corporate-bingo-ai.netlify.app');
    proxyReq.setHeader('User-Agent', 'Corporate-Bingo-Proxy/1.0');
    
    // Log request details
    console.log(`   Target: http://corporatebingo.ryanwixon15.workers.dev${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`📥 Response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Origin, Accept';
    
    // Remove any conflicting headers
    delete proxyRes.headers['x-frame-options'];
  }
};

// Create proxy middleware
const proxy = createProxyMiddleware(proxyOptions);

// Apply proxy to all /api routes
app.use('/api', proxy);

// Catch-all for any other routes
app.use('*', (req, res) => {
  res.json({
    message: 'Corporate Bingo Proxy Server',
    usage: 'Use /api/* routes to access backend',
    health: '/health',
    backend: 'http://corporatebingo.ryanwixon15.workers.dev'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Corporate Bingo Proxy Server running on port ${PORT}`);
  console.log(`🎯 Proxying to: http://corporatebingo.ryanwixon15.workers.dev`);
  console.log(`🌐 CORS enabled for: https://corporate-bingo-ai.netlify.app`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});