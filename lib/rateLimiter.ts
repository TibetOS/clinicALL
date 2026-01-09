/**
 * Client-side rate limiter for preventing abuse of sensitive operations
 *
 * SECURITY NOTE: This is a client-side rate limiter for UX and basic protection.
 * Server-side rate limiting via Supabase RLS or Edge Functions is the primary defense.
 *
 * This client-side limiter:
 * - Prevents accidental rapid-fire requests
 * - Improves UX by providing immediate feedback
 * - Reduces server load from legitimate users
 *
 * It does NOT protect against:
 * - Determined attackers (who can bypass client code)
 * - Multiple browser sessions/devices
 * - API calls made directly to Supabase
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory storage for rate limit tracking
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Creates a rate limiter for a specific operation
 * @param operationName - Unique name for the operation being limited
 * @param config - Rate limit configuration
 * @returns Object with checkLimit and reset methods
 */
export function createRateLimiter(operationName: string, config: RateLimitConfig) {
  const { maxRequests, windowMs } = config;

  return {
    /**
     * Checks if the rate limit has been exceeded
     * @returns Object indicating if allowed, and if not, when to retry
     */
    checkLimit(): { allowed: boolean; retryAfterMs?: number; remaining: number } {
      const now = Date.now();
      const key = operationName;
      const entry = rateLimitStore.get(key);

      // No existing entry or window has expired
      if (!entry || now - entry.windowStart >= windowMs) {
        rateLimitStore.set(key, { count: 1, windowStart: now });
        return { allowed: true, remaining: maxRequests - 1 };
      }

      // Within window - check count
      if (entry.count >= maxRequests) {
        const retryAfterMs = windowMs - (now - entry.windowStart);
        return { allowed: false, retryAfterMs, remaining: 0 };
      }

      // Increment count
      entry.count += 1;
      return { allowed: true, remaining: maxRequests - entry.count };
    },

    /**
     * Resets the rate limit for this operation
     */
    reset(): void {
      rateLimitStore.delete(operationName);
    },

    /**
     * Gets the current status without incrementing
     */
    getStatus(): { remaining: number; resetsInMs: number } {
      const now = Date.now();
      const entry = rateLimitStore.get(operationName);

      if (!entry || now - entry.windowStart >= windowMs) {
        return { remaining: maxRequests, resetsInMs: 0 };
      }

      return {
        remaining: Math.max(0, maxRequests - entry.count),
        resetsInMs: windowMs - (now - entry.windowStart),
      };
    },
  };
}

/**
 * Pre-configured rate limiter for health declaration token creation
 * Allows 10 tokens per minute per session
 */
export const tokenCreationLimiter = createRateLimiter('health-token-creation', {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Pre-configured rate limiter for password reset requests
 * Allows 3 requests per 5 minutes
 */
export const passwordResetLimiter = createRateLimiter('password-reset', {
  maxRequests: 3,
  windowMs: 5 * 60 * 1000, // 5 minutes
});

/**
 * Pre-configured rate limiter for login attempts
 * Allows 5 attempts per 15 minutes
 */
export const loginAttemptLimiter = createRateLimiter('login-attempt', {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});
