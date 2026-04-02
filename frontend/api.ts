/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiLogger } from './apilogger';

// --- API Configuration Management ---
// With the Vite proxy, we no longer need the absolute path.
// The browser makes requests to the same origin, and Vite forwards them.
export const getApiBaseUrl = () => {
    // Prefer a local backend when developing on localhost (so frontend
    // requests hit your local server). Otherwise fall back to the
    // deployed backend. The value can also be overridden by setting
    // `window.__API_BASE__` in the browser or `VITE_API_BASE` at build time.
    try {
        const globalAny: any = window as any;
        if (globalAny && globalAny.__API_BASE__) return globalAny.__API_BASE__;
        // Vite environment variable (if set during build/dev)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const viteBase = (import.meta as any)?.env?.VITE_API_BASE;
        if (viteBase) return viteBase;
        const host = window && window.location && window.location.hostname ? window.location.hostname : '';
        if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:8787';
        // Fallback to deployed server
        return 'https://lol-j8ni.onrender.com';
    } catch (e) {
        return 'https://lol-j8ni.onrender.com';
    }
};


// --- Core Request Logic ---
// Fix: Type the `options` parameter with `RequestInit` to allow fetch options.
async function request(endpoint: string, options: RequestInit = {}) {
    const API_BASE = getApiBaseUrl();
    const MAX_RETRIES = 2;
    const RETRY_DELAY_MS = 500;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        const start = Date.now();
        try {
            // Include credentials so browser sends session cookie to the server
            const response = await fetch(`${API_BASE}${endpoint}`, {
                credentials: 'include',
                ...options,
                headers: {
                    'Content-Type': 'application/json',
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

export const deleteProfessor = (id) => request(`/api/professors/${id}`, {
    method: 'DELETE',
});

export const deleteDepartment = (id: string) => request(`/api/departments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
});

export const registerPublicUser = (userData: {name: string, email: string, password: string, apiKey?: string}) => request('/api/public-register', {
    method: 'POST',
    body: JSON.stringify(userData),
});

export const getCurrentUser = () => request('/api/me');

export const logout = () => request('/api/logout', { method: 'POST' });

// Track a visitor quickly (one-time): name + email
export const trackVisit = (payload: { name: string, email: string }) => request('/api/track-visit', {
    method: 'POST',
    body: JSON.stringify(payload),
});

// Fetch tracked visitors (admin use)
export const fetchVisitors = () => request('/api/visitors');