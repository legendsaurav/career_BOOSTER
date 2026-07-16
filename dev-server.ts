#!/usr/bin/env node
/**
 * Custom dev server that runs Vite on a different port
 * and proxies requests through, while handling /api/* routes locally.
 */

import http from 'http';
import { createServer as createViteServer } from 'vite';
import react from '@vitejs/plugin-react';

const VITE_PORT = parseInt(process.env.VITE_PORT || '5175', 10);
const DEV_PORT = parseInt(process.env.DEV_PORT || '5173', 10);

async function runDevServer() {
  // Create Vite dev server (on a different port, not exposed directly)
  const vite = await createViteServer({
    plugins: [react()],
    server: { hmr: { protocol: 'ws', host: 'localhost', port: DEV_PORT } },
  });

  // Create our proxy server
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Handle /api/external/google-cse locally
    if (pathname === '/api/external/google-cse' && req.method === 'POST') {
      try {
        let body = '';
        await new Promise<void>((resolve, reject) => {
          req.on('data', (chunk: any) => {
            body += chunk;
            if (body.length > 100_000) {
              reject(new Error('Body too large'));
            }
          });
          req.on('end', () => resolve());
          req.on('error', reject);
        });

        const payload = body ? JSON.parse(body) : {};
        const q = String(payload.q || '').trim();

        if (!q) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required field: q' }));
          return;
        }

        const section = String(payload.section || 'PROJECTS').toUpperCase();
        const apiKey = process.env[`GOOGLE_CSE_KEY_${section}`] ||
          process.env[`VITE_GOOGLE_CSE_KEY_${section}`] || '';
        const cx = process.env[`GOOGLE_CSE_CX_${section}`] ||
          process.env[`VITE_GOOGLE_CSE_CX_${section}`] || '';

        if (!apiKey || !cx) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: `Google CSE not configured for section ${section}. Set env vars GOOGLE_CSE_KEY_${section} and GOOGLE_CSE_CX_${section}.`,
          }));
          return;
        }

        const num = Math.min(10, Math.max(1, Number(payload.num || 10)));
        const start = Math.min(91, Math.max(1, Number(payload.start || 1)));
        const dateRestrict = payload.dateRestrict ? String(payload.dateRestrict).trim() : '';

        const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
        searchUrl.searchParams.set('key', apiKey);
        searchUrl.searchParams.set('cx', cx);
        searchUrl.searchParams.set('q', q);
        searchUrl.searchParams.set('num', String(num));
        searchUrl.searchParams.set('start', String(start));
        if (dateRestrict) searchUrl.searchParams.set('dateRestrict', dateRestrict);

        const response = await fetch(searchUrl.toString());
        const text = await response.text();

        res.writeHead(response.status, { 'Content-Type': 'application/json' });
        res.end(text);
        return;
      } catch (e: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e?.message || 'Internal error' }));
        return;
      }
    }

    // Proxy everything else to Vite
    const viteUrl = `http://localhost:${VITE_PORT}${req.url}`;
    try {
      const viteRes = await fetch(viteUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${VITE_PORT}`,
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      } as any);

      res.writeHead(viteRes.status, Object.fromEntries(viteRes.headers.entries()));
      res.end(await viteRes.text());
    } catch (e: any) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`Vite proxy error: ${e?.message}`);
    }
  });

  server.listen(DEV_PORT, () => {
    console.log(`\n✓ API Proxy server running on http://localhost:${DEV_PORT}`);
    console.log(`  └ Proxying to Vite on port ${VITE_PORT}`);
    console.log(`\n✓ Routes handled locally:`);
    console.log(`  └ POST /api/external/google-cse`);
    console.log(`\nSet Google CSE env vars to enable search:\n  GOOGLE_CSE_KEY_ALUMNI, GOOGLE_CSE_CX_ALUMNI, etc.\n`);
  });

  // Start Vite on the secondary port
  await vite.listen(VITE_PORT);
  console.log(`✓ Vite dev server running on http://localhost:${VITE_PORT} (internal)\n`);
}

runDevServer().catch((err) => {
  console.error('Dev server error:', err);
  process.exit(1);
});
