/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiLogger } from './apilogger';
import { rateLimiter, RateLimitError } from './rateLimiter';
import { validatePayload, BadRequestError, validateId, isValidEmail, isValidPassword, sanitizeString } from './sanitize';

// --- API Configuration Management ---
// With the Vite proxy, we no longer need the absolute path.
// The browser makes requests to the same origin, and Vite forwards them.
export const getApiBaseUrl = () => {
    // Prefer explicit overrides:
    // - `window.__API_BASE__` at runtime (e.g., set from index.html)
    // - `VITE_API_BASE` at build time
    // Otherwise default to same-origin so:
    // - Vite dev server can proxy `/api/*` to your backend
    // - Vercel can serve `/api/*` via Serverless Functions
    let base = '';

    try {
        const w = (typeof window !== 'undefined') ? (window as any) : null;
        const candidate = w && typeof w.__API_BASE__ === 'string' ? w.__API_BASE__ : '';
        if (candidate && candidate.trim()) base = candidate.trim();
    } catch (e) {
        // ignore
    }

    try {
        const envBase = (import.meta as any)?.env?.VITE_API_BASE;
        if (!base && typeof envBase === 'string' && envBase.trim()) base = envBase.trim();
    } catch (e) {
        // ignore
    }

    // Normalize: strip trailing slashes so `${base}${endpoint}` doesn't become `//api/...`.
    base = base.replace(/\/+$/, '');
    return base;
};


// --- Core Request Logic ---
// Fix: Type the `options` parameter with `RequestInit` to allow fetch options.
async function request(endpoint: string, options: RequestInit = {}) {
    const API_BASE = getApiBaseUrl();
    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 500;

    // Validate and sanitize request body early to reject oversized/malformed input
    try {
        if (options.body) {
            // If body is a JSON string, parse and validate
            if (typeof options.body === 'string') {
                const ct = (options.headers && (options.headers as any)['Content-Type']) || 'application/json';
                if (ct.includes('application/json')) {
                    let parsed;
                    try { parsed = JSON.parse(options.body); } catch (e) { throw new BadRequestError('Malformed JSON body'); }
                    const cleaned = validatePayload(parsed);
                    options.body = JSON.stringify(cleaned);
                } else {
                    // Non-JSON string body: limit overall length
                    const max = 10 * 1024;
                    if ((options.body as string).length > max) throw new BadRequestError('Request body too large');
                }
            } else if (options.body instanceof FormData) {
                // Limit number of fields and each field length
                const MAX_FIELDS = 50;
                const entries = Array.from((options.body as FormData).entries());
                if (entries.length > MAX_FIELDS) throw new BadRequestError('Too many form fields');
                for (const [k, v] of entries) {
                    if (typeof v === 'string') sanitizeString(v);
                }
            } else if (typeof options.body === 'object') {
                // If someone passed an object directly, validate
                const cleaned = validatePayload(options.body);
                options.body = JSON.stringify(cleaned);
            }
        }
    } catch (err) {
        apiLogger.log('BAD_REQUEST', `${options.method || 'GET'} ${endpoint}`, 400, 0, (err as any).message);
        throw err;
    }

    // Check rate limit before making the request
    const rateLimitCheck = rateLimiter.checkRateLimit(endpoint);
    if (!rateLimitCheck.allowed) {
        apiLogger.log('RATE_LIMITED', `${options.method || 'GET'} ${endpoint}`, 429, 0, 'Rate limit exceeded');
        throw new RateLimitError(endpoint, rateLimitCheck.remaining, rateLimitCheck.resetTime);
    }

    // Record this request attempt
    rateLimiter.recordRequest(endpoint);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const start = Date.now();
        try {
            // Attach the admin token (if logged in) so protected write endpoints authorize.
            let adminToken = '';
            try { adminToken = (typeof localStorage !== 'undefined' && localStorage.getItem('cb_admin_token')) || ''; } catch (e) { /* ignore */ }
            // Include credentials so browser sends session cookie to the server
            const response = await fetch(`${API_BASE}${endpoint}`, {
                credentials: 'include',
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
                    ...options.headers,
                },
            });
            const duration = Date.now() - start;
            if (!response.ok) {
                const errorText = await response.text();
                // Try to parse the error text as JSON, as the server might send structured errors.
                let errorMessage = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorText;
                } catch (e) {
                    // Not a JSON response, use the raw text.
                }

                apiLogger.log('ERROR', `${options.method || 'GET'} ${endpoint}`, response.status, duration, errorMessage);
                const err: any = new Error(errorMessage || `HTTP ${response.status}`);
                // Attach status so callers can distinguish server errors vs network failures.
                err.status = response.status;
                throw err;
            }
            const data = await response.json();
            apiLogger.log('SUCCESS', `${options.method || 'GET'} ${endpoint}`, response.status, duration, data);
            return data; // Success, exit the function
        } catch (error) {
            const duration = Date.now() - start;

            // If it's a network error and we have retries left, wait and continue the loop.
            if (attempt < MAX_RETRIES && error instanceof TypeError && error.message.includes('fetch')) {
                console.warn(`API request to ${endpoint} failed. Retrying in ${RETRY_DELAY_MS * (attempt + 1)}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
                continue;
            }

            // If it's another type of error, or we're out of retries, log and throw.
            apiLogger.log('FAIL', `${options.method || 'GET'} ${endpoint}`, 0, duration, error.message);
            console.error(`API request failed for ${endpoint}:`, error);
            throw error; // Failure, exit the function by throwing
        }
    }
}

// --- Exported API Functions ---

export const fetchMockData = () => request('/api/mock-data');

export const updateProfessor = (professor) => request('/api/datas/update', {
    method: 'POST',
    body: JSON.stringify(professor),
});

export const deleteProfessor = (id) => {
    validateId(String(id));
    return request(`/api/professors/${id}`, {
        method: 'DELETE',
    });
};

export const deleteDepartment = (id: string) => {
    validateId(id);
    return request(`/api/departments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
};

export const registerPublicUser = (userData: {name: string, email: string, password: string, apiKey?: string}) => {
    // Basic client-side validation
    const name = sanitizeString(userData.name || '');
    const email = userData.email || '';
    const password = userData.password || '';
    if (!isValidEmail(email)) throw new BadRequestError('Invalid email');
    if (!isValidPassword(password)) throw new BadRequestError('Invalid password (minimum 8 characters)');
    return request('/api/public-register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, apiKey: userData.apiKey }),
    });
};

// --- Rate Limit Management ---

/**
 * Get the rate limit status for a specific endpoint
 */
export const getRateLimitStatus = (endpoint: string) => {
    return rateLimiter.getStatus(endpoint);
};

/**
 * Set a custom rate limit for a specific endpoint
 * @param endpoint - The endpoint path
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export const setEndpointRateLimit = (endpoint: string, maxRequests: number, windowMs: number) => {
    rateLimiter.setLimit(endpoint, maxRequests, windowMs);
};

/**
 * Check if a request is allowed for an endpoint
 */
export const canMakeRequest = (endpoint: string) => {
    const check = rateLimiter.checkRateLimit(endpoint);
    return check.allowed;
};

/**
 * Get remaining requests for an endpoint before rate limit is hit
 */
export const getRemainingRequests = (endpoint: string) => {
    const check = rateLimiter.checkRateLimit(endpoint);
    return check.remaining;
};

/**
 * Reset all rate limits (useful for testing - use with caution)
 */
export const resetAllRateLimits = () => {
    rateLimiter.reset();
};

/**
 * Reset rate limit for a specific endpoint (useful for testing)
 */
export const resetEndpointRateLimit = (endpoint: string) => {
    rateLimiter.resetEndpoint(endpoint);
};

// Export rate limit error for error handling
export { RateLimitError } from './rateLimiter';

export const getCurrentUser = () => request('/api/me');

export const logout = () => request('/api/logout', { method: 'POST' });

// Admin login: verifies server-side credentials and stores a write token for later requests.
export const adminLogin = async (email: string, password: string) => {
    const data = await request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    if (data && data.token) {
        try { localStorage.setItem('cb_admin_token', data.token); } catch (e) { /* ignore */ }
    }
    return data;
};

export const clearAdminToken = () => {
    try { localStorage.removeItem('cb_admin_token'); } catch (e) { /* ignore */ }
};

// --- INTERVIEWER bridge (backend forwards to the redesigned session API) ---
export const startInterviewSession = (payload: any) => request('/api/interview/start', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
});

export const getInterviewStatus = (id: string) => request(`/api/interview/status/${encodeURIComponent(id)}`);

// Internship request: notifies the admin mailbox (ls1837220@gmail.com) with Accept/Reject buttons.
export const submitInternshipRequest = (payload: {
    userName: string; userEmail: string; professorId: string;
    professorName?: string; branchName?: string; message?: string;
    resumePath?: string; resumeName?: string; resumeLink?: string;
}) => request('/api/internship/request', { method: 'POST', body: JSON.stringify(payload) });

// Poll the student's latest internship-request status (gates the MINE section).
export const getInternshipStatus = (email: string, professorId?: string) =>
    request(`/api/internship/status?email=${encodeURIComponent(email)}${professorId ? `&professorId=${encodeURIComponent(professorId)}` : ''}`);

// Upload a resume file (multipart) -> returns { resumePath, resumeName } to attach to the request.
export const uploadResume = async (file: File): Promise<{ resumePath: string; resumeName: string }> => {
    const API_BASE = getApiBaseUrl();
    const fd = new FormData();
    fd.append('resume', file);
    const resp = await fetch(`${API_BASE}/api/internship/resume`, { method: 'POST', body: fd, credentials: 'include' });
    if (!resp.ok) throw new Error((await resp.text()) || 'Resume upload failed');
    return resp.json();
};

// Track a visitor quickly (one-time): name + email
export const trackVisit = (payload: { name: string, email: string }) => request('/api/track-visit', {
    method: 'POST',
    body: JSON.stringify(payload),
});

// Fetch tracked visitors (admin use)
export const fetchVisitors = () => request('/api/visitors');

// --- External Service Proxies (server-side keys only) ---
// These endpoints must be implemented on the backend (localhost:8787).
// The frontend must NEVER call third-party APIs with secret keys.

export type GoogleCseProxyRequest = {
    section?: string;
    q: string;
    num?: number;
    start?: number;
    dateRestrict?: string; // e.g. 'w1'
};

export const googleCseSearch = (payload: GoogleCseProxyRequest) => request('/api/external/google-cse', {
    method: 'POST',
    body: JSON.stringify(payload),
});

export type PerplexityChatProxyRequest = {
    model?: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
};

export const perplexityChatCompletions = (payload: PerplexityChatProxyRequest) => request('/api/external/perplexity/chat-completions', {
    method: 'POST',
    body: JSON.stringify(payload),
});

export type GeminiGenerateTextProxyRequest = {
    text: string;
    temperature?: number;
    maxOutputTokens?: number;
};

export const geminiGenerateText = (payload: GeminiGenerateTextProxyRequest) => request('/api/external/gemini/generateText', {
    method: 'POST',
    body: JSON.stringify(payload),
});

// --- Desktop AI Copilot gateway (chatbot + repo analyser) ---
// The backend proxies these to the gateway; the sk_copilot_ key never reaches the browser.
// conversationId keeps each user's conversation isolated on the gateway (no overlap).
export const aiChat = (payload: { conversationId: string; message: string; mode?: string }): Promise<{ content: string }> =>
    request('/api/ai/chat', { method: 'POST', body: JSON.stringify(payload) });

export const aiRepo = (payload: { conversationId: string; url: string }): Promise<{ content: string }> =>
    request('/api/ai/repo', { method: 'POST', body: JSON.stringify(payload) });

// MINE Google Search AI Mode: live, web-grounded answer scoped to the student's context.
export type AiSource = { url: string; domain: string };
export const aiSearch = (payload: {
    conversationId: string;
    query: string;
    context?: { professorName?: string; branchName?: string; company?: string };
}): Promise<{ content: string; sources: AiSource[] }> =>
    request('/api/ai/search', { method: 'POST', body: JSON.stringify(payload) });