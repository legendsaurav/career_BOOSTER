/**
 * Rate Limiting Implementation Guide & Example
 * 
 * This file demonstrates how to use the rate limiting system
 * in your React components.
 */

// ============================================================================
// EXAMPLE 1: Basic Usage in a Login Component
// ============================================================================

/*
import { useState } from 'react';
import { registerPublicUser, RateLimitError } from './api';
import { getRateLimitErrorMessage } from './rateLimitErrorHandler';

export function LoginComponent() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (email: string, password: string) => {
        setError(null);
        setLoading(true);

        try {
            await registerPublicUser({
                name: 'User',
                email,
                password,
            });
            // Success - redirect or update state
        } catch (err) {
            // Check if it's a rate limit error
            const rateLimitMessage = getRateLimitErrorMessage(err);
            if (rateLimitMessage) {
                setError(rateLimitMessage);
                return; // Don't re-throw
            }
            
            // Handle other errors normally
            setError('Login failed. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div className="error-banner">{error}</div>}
            <button onClick={() => handleLogin('test@example.com', 'password')} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </div>
    );
}
*/

// ============================================================================
// EXAMPLE 2: Using Rate Limit Status in Components
// ============================================================================

/*
import { useEffect, useState } from 'react';
import { getRateLimitStatus, canMakeRequest } from './api';

export function RateLimitStatus() {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const status = getRateLimitStatus('/api/public-register');
        setStatus(status);
    }, []);

    if (!status) return null;

    return (
        <div>
            <p>Login Attempts: {status.requests}/{status.limit}</p>
            <p>Resets at: {status.resetAt}</p>
        </div>
    );
}
*/

// ============================================================================
// EXAMPLE 3: Advanced Error Handling with Retry Logic
// ============================================================================

/*
import { RateLimitError } from './api';
import { createRetryScheduler, isRateLimitError } from './rateLimitErrorHandler';

async function makeRequestWithRetry(apiCall: () => Promise<any>, endpoint: string) {
    const scheduler = createRetryScheduler(3);

    while (true) {
        try {
            return await apiCall();
        } catch (error) {
            if (isRateLimitError(error)) {
                // Don't retry rate limit errors - they have a built-in wait time
                throw error;
            }

            if (scheduler.canRetry()) {
                const delay = scheduler.getRetryDelay();
                console.log(`Retrying in ${delay}ms... (attempt ${scheduler.getRetryCount() + 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                scheduler.recordRetry();
                continue;
            }

            throw error;
        }
    }
}
*/

// ============================================================================
// CONFIGURATION: Adding More Rate Limit Rules
// ============================================================================

/*
Import in your app initialization:

import { setEndpointRateLimit } from './api';

// In your app setup (e.g., in main.tsx or App.tsx):

// Stricter limit for sensitive endpoints
setEndpointRateLimit('/api/admin/delete', 2, 60 * 1000); // 2 per minute

// Standard limits for public endpoints
setEndpointRateLimit('/api/public-data', 20, 60 * 1000); // 20 per minute

// Search endpoints - higher limit
setEndpointRateLimit('/api/search', 30, 60 * 1000); // 30 per minute
*/

// ============================================================================
// DEFAULT RATE LIMITS
// ============================================================================

/*
Login/Auth Endpoints (5 per 15 minutes):
- /api/public-register
- /api/auth/login
- /api/auth/register
- /api/auth/password-reset
- /api/auth/verify

All Other Endpoints (10 per 1 minute):
- Default limit applied to any endpoint not explicitly configured

You can override these limits using setEndpointRateLimit()
*/

// ============================================================================
// TESTING & DEBUGGING
// ============================================================================

/*
In development/testing, you can reset rate limits:

import { resetAllRateLimits, resetEndpointRateLimit } from './api';

// Reset everything
resetAllRateLimits();

// Reset specific endpoint
resetEndpointRateLimit('/api/public-register');

// Check rate limit status
import { getRateLimitStatus, canMakeRequest } from './api';

const status = getRateLimitStatus('/api/public-register');
console.log('Status:', status);
// Output:
// {
//   limit: 5,
//   window: 900000,  // 15 minutes in ms
//   requests: 2,
//   resetAt: "2026-05-05T12:30:00.000Z"
// }

const allowed = canMakeRequest('/api/public-register');
console.log('Can make request:', allowed);
*/

export const RATE_LIMIT_GUIDE = `
Rate Limiting Implementation Complete!

✅ Features Implemented:
- Login endpoints: 5 attempts per 15 minutes
- Other endpoints: 10 attempts per 1 minute
- Automatic rate limit checks before each request
- RateLimitError with retry timing information
- Per-endpoint configuration support
- Error handler utilities for React components

✅ How It Works:
1. Every API request goes through rate limit check
2. If limit exceeded, RateLimitError is thrown immediately
3. Error includes retry timing information
4. Clients can catch and display user-friendly messages

✅ Integration Points:
- All calls to request() automatically check rate limits
- Error handling in components using getRateLimitErrorMessage()
- Optional: Configure custom limits per endpoint
- Optional: Monitor status with getRateLimitStatus()
`;
