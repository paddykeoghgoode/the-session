/**
 * Client-side rate limiting utility
 * Tracks actions per key and enforces limits
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate limited
 * @param key - Unique identifier for the action (e.g., 'submit-price-{userId}')
 * @param limit - Maximum number of actions allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed boolean and remaining count
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry or window has expired, reset
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Format time until reset in human readable format
 */
export function formatTimeUntilReset(resetAt: number): string {
  const now = Date.now();
  const diff = resetAt - now;

  if (diff <= 0) return 'now';

  const seconds = Math.ceil(diff / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.ceil(minutes / 60);
  return `${hours}h`;
}

// Pre-defined rate limit configs
export const RATE_LIMITS = {
  // Price submissions: 10 per hour
  PRICE_SUBMIT: { limit: 10, windowMs: 60 * 60 * 1000 },
  // Review submissions: 5 per hour
  REVIEW_SUBMIT: { limit: 5, windowMs: 60 * 60 * 1000 },
  // Report submissions: 10 per hour
  REPORT_SUBMIT: { limit: 10, windowMs: 60 * 60 * 1000 },
  // Photo uploads: 5 per day (handled by DB, but add client check too)
  PHOTO_UPLOAD: { limit: 5, windowMs: 24 * 60 * 60 * 1000 },
  // Votes: 60 per minute (generous for fast voting)
  VOTE: { limit: 60, windowMs: 60 * 1000 },
} as const;

/**
 * React hook for rate limiting
 */
export function useRateLimit(
  actionKey: string,
  config: { limit: number; windowMs: number }
) {
  const check = () => checkRateLimit(actionKey, config.limit, config.windowMs);

  return {
    check,
    isAllowed: () => check().allowed,
    getRemaining: () => check().remaining,
  };
}
