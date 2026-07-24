/**
 * In-memory sliding-window rate limiter.
 * Each Vercel serverless instance gets its own Map, which is acceptable
 * for application-level protection. For true DDoS mitigation, rely on
 * Vercel Edge Network + WAF or Cloudflare upstream.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds to prevent memory leaks
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove entries older than 2 minutes
      entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, 60_000);
  // Allow the process to exit if this is the only thing keeping it alive
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a request is rate-limited.
 * @param key - Unique identifier (usually IP + route category)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { limited: boolean, remaining: number, retryAfterMs: number }
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { limited: boolean; remaining: number; retryAfterMs: number } {
  ensureCleanup();

  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    return { limited: true, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  return {
    limited: false,
    remaining: limit - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Pre-configured rate limiters for different route categories.
 */
export const rateLimits = {
  /** Auth routes: 5 requests per minute */
  auth: (ip: string) => rateLimit(`auth:${ip}`, 5, 60_000),

  /** OTP send/verify: 8 requests per minute per IP */
  otp: (ip: string) => rateLimit(`otp:${ip}`, 8, 60_000),

  /** Community reads: 60 requests per minute */
  communityRead: (ip: string) => rateLimit(`comm-r:${ip}`, 60, 60_000),

  /** Community writes: 10 requests per minute */
  communityWrite: (ip: string) => rateLimit(`comm-w:${ip}`, 10, 60_000),

  /** Reports: 3 per minute */
  report: (ip: string) => rateLimit(`report:${ip}`, 3, 60_000),

  /** Analytics beacons: generous, but bounded so it can't be used to flood. */
  track: (ip: string) => rateLimit(`track:${ip}`, 120, 60_000),

  /** Upvotes: 30 per minute */
  upvote: (ip: string) => rateLimit(`upvote:${ip}`, 30, 60_000),
};
