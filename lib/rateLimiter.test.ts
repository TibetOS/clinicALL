import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createRateLimiter,
  tokenCreationLimiter,
  passwordResetLimiter,
  loginAttemptLimiter,
} from './rateLimiter';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within the limit', () => {
    const limiter = createRateLimiter('test-op', {
      maxRequests: 3,
      windowMs: 60000,
    });

    const result1 = limiter.checkLimit();
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = limiter.checkLimit();
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = limiter.checkLimit();
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests exceeding the limit', () => {
    const limiter = createRateLimiter('test-block', {
      maxRequests: 2,
      windowMs: 60000,
    });

    limiter.checkLimit(); // 1st
    limiter.checkLimit(); // 2nd

    const result = limiter.checkLimit(); // 3rd - should be blocked
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeDefined();
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(60000);
  });

  it('should reset after window expires', () => {
    const limiter = createRateLimiter('test-expire', {
      maxRequests: 2,
      windowMs: 60000,
    });

    limiter.checkLimit();
    limiter.checkLimit();

    // Should be blocked
    expect(limiter.checkLimit().allowed).toBe(false);

    // Advance time past window
    vi.advanceTimersByTime(60001);

    // Should be allowed again
    const result = limiter.checkLimit();
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('should allow manual reset', () => {
    const limiter = createRateLimiter('test-reset', {
      maxRequests: 1,
      windowMs: 60000,
    });

    limiter.checkLimit();
    expect(limiter.checkLimit().allowed).toBe(false);

    limiter.reset();

    const result = limiter.checkLimit();
    expect(result.allowed).toBe(true);
  });

  it('should report correct status without incrementing', () => {
    const limiter = createRateLimiter('test-status', {
      maxRequests: 5,
      windowMs: 60000,
    });

    // Check status before any requests
    const initialStatus = limiter.getStatus();
    expect(initialStatus.remaining).toBe(5);
    expect(initialStatus.resetsInMs).toBe(0);

    // Make some requests
    limiter.checkLimit();
    limiter.checkLimit();

    // Check status - should not increment
    const status = limiter.getStatus();
    expect(status.remaining).toBe(3);
    expect(status.resetsInMs).toBeGreaterThan(0);

    // Verify status check didn't increment
    const statusAgain = limiter.getStatus();
    expect(statusAgain.remaining).toBe(3);
  });

  it('should calculate retryAfterMs correctly', () => {
    const limiter = createRateLimiter('test-retry', {
      maxRequests: 1,
      windowMs: 10000, // 10 seconds
    });

    limiter.checkLimit();

    // Advance 3 seconds
    vi.advanceTimersByTime(3000);

    const result = limiter.checkLimit();
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(6000);
    expect(result.retryAfterMs).toBeLessThanOrEqual(7000);
  });
});

describe('Pre-configured rate limiters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset all pre-configured limiters
    tokenCreationLimiter.reset();
    passwordResetLimiter.reset();
    loginAttemptLimiter.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('tokenCreationLimiter', () => {
    it('should allow 10 requests per minute', () => {
      for (let i = 0; i < 10; i++) {
        expect(tokenCreationLimiter.checkLimit().allowed).toBe(true);
      }
      expect(tokenCreationLimiter.checkLimit().allowed).toBe(false);
    });

    it('should reset after 1 minute', () => {
      for (let i = 0; i < 10; i++) {
        tokenCreationLimiter.checkLimit();
      }
      expect(tokenCreationLimiter.checkLimit().allowed).toBe(false);

      vi.advanceTimersByTime(60001);
      expect(tokenCreationLimiter.checkLimit().allowed).toBe(true);
    });
  });

  describe('passwordResetLimiter', () => {
    it('should allow 3 requests per 5 minutes', () => {
      for (let i = 0; i < 3; i++) {
        expect(passwordResetLimiter.checkLimit().allowed).toBe(true);
      }
      expect(passwordResetLimiter.checkLimit().allowed).toBe(false);
    });

    it('should reset after 5 minutes', () => {
      for (let i = 0; i < 3; i++) {
        passwordResetLimiter.checkLimit();
      }
      expect(passwordResetLimiter.checkLimit().allowed).toBe(false);

      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      expect(passwordResetLimiter.checkLimit().allowed).toBe(true);
    });
  });

  describe('loginAttemptLimiter', () => {
    it('should allow 5 attempts per 15 minutes', () => {
      for (let i = 0; i < 5; i++) {
        expect(loginAttemptLimiter.checkLimit().allowed).toBe(true);
      }
      expect(loginAttemptLimiter.checkLimit().allowed).toBe(false);
    });

    it('should reset after 15 minutes', () => {
      for (let i = 0; i < 5; i++) {
        loginAttemptLimiter.checkLimit();
      }
      expect(loginAttemptLimiter.checkLimit().allowed).toBe(false);

      vi.advanceTimersByTime(15 * 60 * 1000 + 1);
      expect(loginAttemptLimiter.checkLimit().allowed).toBe(true);
    });

    it('should provide correct remaining count', () => {
      const result1 = loginAttemptLimiter.checkLimit();
      expect(result1.remaining).toBe(4);

      const result2 = loginAttemptLimiter.checkLimit();
      expect(result2.remaining).toBe(3);

      loginAttemptLimiter.checkLimit();
      loginAttemptLimiter.checkLimit();

      const result5 = loginAttemptLimiter.checkLimit();
      expect(result5.remaining).toBe(0);
    });
  });
});
