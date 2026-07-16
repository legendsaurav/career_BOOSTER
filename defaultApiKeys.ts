// DO NOT commit or ship API keys in the frontend.
// This file intentionally contains no secrets.
//
// If you need Google Custom Search, route requests through your backend
// (see `googleCseSearch` in `api.ts`) where keys live in server env vars.

export const DEFAULT_API_KEYS: Record<string, never> = {};
