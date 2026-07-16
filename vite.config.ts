import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Avoid TS errors about `process` when running Vite config in a TypeScript
// environment without @types/node. This is safe for a dev-only config file.
declare const process: any;

export default defineConfig({
  plugins: [react()],
  server: {
    // Dev: forward real API calls to the local Career Booster backend so the frontend works
    // same-origin (no CORS, no baked absolute URL). MUST be '/api/' (trailing slash) so it does
    // NOT swallow source-module requests like /api.ts or /apilogger.ts (which broke the app).
    proxy: {
      '/api/': {
        target: process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
})