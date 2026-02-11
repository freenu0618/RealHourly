/**
 * Simple in-memory sliding-window rate limiter.
 * For production at scale, replace with Redis-based limiter.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function rateLimit(options: { limit: number; windowMs: number }) {
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const CLEANUP_INTERVAL = 5 * 60 * 1000;
  let lastCleanup = Date.now();

  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }

  return {
    async check(key: string): Promise<{ success: boolean; remaining: number; retryAfterMs: number }> {
      cleanup();
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return { success: true, remaining: options.limit - 1, retryAfterMs: 0 };
      }

      if (entry.count >= options.limit) {
        const retryAfterMs = entry.resetAt - now;
        return { success: false, remaining: 0, retryAfterMs };
      }

      entry.count++;
      return { success: true, remaining: options.limit - entry.count, retryAfterMs: 0 };
    },
  };
}

// Pre-configured rate limiters for AI endpoints
export const parseRateLimit = rateLimit({ limit: 20, windowMs: 60_000 });
export const messageRateLimit = rateLimit({ limit: 10, windowMs: 60_000 });
export const reportRateLimit = rateLimit({ limit: 5, windowMs: 60_000 });
export const transcribeRateLimit = rateLimit({ limit: 10, windowMs: 60_000 });
export const publicReportRateLimit = rateLimit({ limit: 60, windowMs: 60_000 });
export const chatRateLimit = rateLimit({ limit: 15, windowMs: 60_000 });
