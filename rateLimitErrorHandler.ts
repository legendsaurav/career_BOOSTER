/**
 * Rate Limit Error Handler
 * Utilities for handling and displaying rate limit errors in the UI
 */

import { RateLimitError } from './rateLimiter';

export interface RateLimitErrorInfo {
    message: string;
    endpoint: string;
    remaining: number;
    retryAfterSeconds: number;
    resetTime: Date;
}

/**
 * Parse a rate limit error and extract useful information
 */
export function parseRateLimitError(error: unknown): RateLimitErrorInfo | null {
    if (!(error instanceof RateLimitError)) {
        return null;
    }

    return {
        message: error.message,
        endpoint: 'unknown',
        remaining: error.remaining,
        retryAfterSeconds: error.retryAfter,
        resetTime: new Date(error.resetTime),
    };
}

/**
 * User-friendly error message for rate limit errors
 */
export function getRateLimitErrorMessage(error: unknown): string | null {
    const info = parseRateLimitError(error);
    if (!info) {
        return null;
    }

    if (info.message.includes('login') || info.message.includes('register') || info.message.includes('auth')) {
        return `Too many login attempts. Please try again in ${info.retryAfterSeconds} seconds.`;
    }

    return `Too many requests. Please try again in ${info.retryAfterSeconds} seconds.`;
}

/**
 * Hook-friendly error handler for React components
 * Usage: 
 * ```
 * try {
 *   await makeApiCall();
 * } catch (error) {
 *   const handled = handleRateLimitError(error, setError);
 *   if (!handled) throw error; // Re-throw if not a rate limit error
 * }
 * ```
 */
export function handleRateLimitError(
    error: unknown,
    onError: (message: string, duration: number) => void
): boolean {
    const message = getRateLimitErrorMessage(error);
    if (!message) {
        return false;
    }

    const info = parseRateLimitError(error);
    onError(message, info?.retryAfterSeconds || 60);
    return true;
}

/**
 * Format remaining requests message for display
 */
export function formatRemainingRequests(remaining: number, total: number): string {
    return `${remaining}/${total} requests remaining`;
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
    return error instanceof RateLimitError;
}

/**
 * Create a retry scheduler for rate-limited requests
 */
export function createRetryScheduler(maxRetries = 3) {
    let retryCount = 0;

    return {
        canRetry: () => retryCount < maxRetries,
        getRetryDelay: () => {
            // Exponential backoff: 1s, 2s, 4s
            return Math.pow(2, retryCount) * 1000;
        },
        recordRetry: () => {
            retryCount++;
        },
        reset: () => {
            retryCount = 0;
        },
        getRetryCount: () => retryCount,
    };
}
