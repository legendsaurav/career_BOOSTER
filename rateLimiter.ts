/**
 * Rate Limiting Utility
 * Implements request rate limiting with configurable limits per endpoint
 */

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number; // Time window in milliseconds
}

interface RequestRecord {
    timestamp: number;
}

interface EndpointLimits {
    [key: string]: RequestRecord[];
}

/**
 * RateLimiter manages request throttling for API endpoints
 * Default: 10 requests per minute for regular endpoints
 * Login: 5 requests per 15 minutes
 */
export class RateLimiter {
    private requestLogs: EndpointLimits = {};
    private limits: Map<string, RateLimitConfig> = new Map();
    private defaultLimit: RateLimitConfig = {
        maxRequests: 10,
        windowMs: 60000, // 1 minute
    };
    private loginLimit: RateLimitConfig = {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
    };

    constructor() {
        this.initializeLoginLimits();
    }

    /**
     * Set up stricter limits for login-related endpoints
     */
    private initializeLoginLimits(): void {
        const loginEndpoints = [
            '/api/public-register',
            '/api/auth/login',
            '/api/auth/register',
            '/api/auth/password-reset',
            '/api/auth/verify',
        ];

        loginEndpoints.forEach(endpoint => {
            this.limits.set(endpoint, this.loginLimit);
        });
    }

    /**
     * Set a custom rate limit for a specific endpoint
     */
    public setLimit(endpoint: string, maxRequests: number, windowMs: number): void {
        this.limits.set(endpoint, { maxRequests, windowMs });
    }

    /**
     * Check if a request is allowed
     * @returns { allowed: boolean, remaining: number, resetTime: number }
     */
    public checkRateLimit(endpoint: string): { 
        allowed: boolean; 
        remaining: number; 
        resetTime: number;
    } {
        const now = Date.now();
        const config = this.limits.get(endpoint) || this.defaultLimit;
        
        // Initialize request log for this endpoint
        if (!this.requestLogs[endpoint]) {
            this.requestLogs[endpoint] = [];
        }

        // Remove expired requests from the window
        this.requestLogs[endpoint] = this.requestLogs[endpoint].filter(
            request => now - request.timestamp < config.windowMs
        );

        const requestCount = this.requestLogs[endpoint].length;
        const allowed = requestCount < config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - requestCount);
        
        // Calculate when the oldest request expires
        const resetTime = 
            this.requestLogs[endpoint].length > 0
                ? this.requestLogs[endpoint][0].timestamp + config.windowMs
                : now;

        return { allowed, remaining, resetTime };
    }

    /**
     * Record a request attempt
     */
    public recordRequest(endpoint: string): void {
        if (!this.requestLogs[endpoint]) {
            this.requestLogs[endpoint] = [];
        }
        this.requestLogs[endpoint].push({ timestamp: Date.now() });
    }

    /**
     * Get rate limit status for an endpoint
     */
    public getStatus(endpoint: string): {
        limit: number;
        window: number;
        requests: number;
        resetAt: string;
    } {
        const config = this.limits.get(endpoint) || this.defaultLimit;
        const requests = this.requestLogs[endpoint]?.length || 0;
        const now = Date.now();
        const oldestRequest = this.requestLogs[endpoint]?.[0]?.timestamp;
        const resetAt = oldestRequest ? new Date(oldestRequest + config.windowMs).toISOString() : 'N/A';

        return {
            limit: config.maxRequests,
            window: config.windowMs,
            requests,
            resetAt,
        };
    }

    /**
     * Reset all rate limit records (useful for testing)
     */
    public reset(): void {
        this.requestLogs = {};
    }

    /**
     * Reset rate limit for a specific endpoint
     */
    public resetEndpoint(endpoint: string): void {
        delete this.requestLogs[endpoint];
    }
}

// Export a singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Error class for rate limit exceeded
 */
export class RateLimitError extends Error {
    public readonly remaining: number;
    public readonly resetTime: number;
    public readonly retryAfter: number;

    constructor(endpoint: string, remaining: number, resetTime: number) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        super(
            `Rate limit exceeded for ${endpoint}. Try again in ${retryAfter} seconds.`
        );
        this.name = 'RateLimitError';
        this.remaining = remaining;
        this.resetTime = resetTime;
        this.retryAfter = retryAfter;
    }
}
