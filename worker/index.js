// Jargon Worker — entry point.
// Dispatches API routes by namespace; re-exports Durable Objects for wrangler bindings.

import { corsHeaders } from './cors.js';
import { handleDuoRequest, BingoRoom } from './duo.js';
import { DashboardAnalytics } from '../analytics-worker.js';

export { BingoRoom, DashboardAnalytics };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders(origin)
      });
    }

    try {
      // Analytics delegation
      if (url.pathname === '/api/performance' ||
          url.pathname === '/api/buzzwords' ||
          url.pathname === '/api/analytics/players' ||
          url.pathname.startsWith('/api/ingest') ||
          url.pathname.startsWith('/ws/dashboard')) {
        try {
          if (!env.ANALYTICS) {
            return new Response(JSON.stringify({
              error: 'Analytics service temporarily unavailable'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
            });
          }
          const analyticsId = env.ANALYTICS.idFromName('dashboard-analytics');
          const analyticsObj = env.ANALYTICS.get(analyticsId);
          return analyticsObj.fetch(request, env);
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Analytics unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
          });
        }
      }

      // Duo
      const duoResponse = await handleDuoRequest(request, env, origin);
      if (duoResponse) return duoResponse;

      // Health
      if (url.pathname === '/api/health' || url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: Date.now(),
          version: '2.0.0-duo',
          endpoint: url.pathname
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      // Legacy room endpoints
      if (url.pathname.startsWith('/api/room/')) {
        return new Response(JSON.stringify({
          error: 'Legacy room endpoints deprecated. Use /api/duo/* for duo mode.'
        }), {
          status: 410,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
      }

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
      });
    }
  }
};
