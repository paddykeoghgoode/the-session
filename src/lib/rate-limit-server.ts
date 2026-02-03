/**
 * Server-side rate limiter for API routes
 * Works with Vercel serverless functions
 * For production scale, consider using Upstash Redis or Vercel KV
 */

import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., user ID or IP address)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Periodically clean up old entries (1% chance per request)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  // No entry or entry expired - create new one
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowSeconds * 1000;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime,
    };
  }

  // Entry exists and not expired - check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limiter identifier from request
 * Uses user ID if authenticated, otherwise falls back to IP
 */
export function getRateLimitIdentifier(
  request: Request,
  userId?: string
): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address (Vercel provides this in headers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown';
  return `ip:${ip}`;
}

/**
 * Create a rate limit error response with appropriate headers
 */
export function createRateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(result.remaining + 1),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000)),
        'Retry-After': String(retryAfter),
      },
    }
  );
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  // Friend requests: 10 per hour per user
  FRIEND_REQUEST: { limit: 10, windowSeconds: 3600 },
  // Price submissions: 30 per hour per user
  PRICE_SUBMISSION: { limit: 30, windowSeconds: 3600 },
  // Check-ins: 20 per hour per user
  CHECK_IN: { limit: 20, windowSeconds: 3600 },
  // Review submissions: 10 per hour per user
  REVIEW_SUBMISSION: { limit: 10, windowSeconds: 3600 },
  // Auth endpoints: 5 per minute per IP
  AUTH: { limit: 5, windowSeconds: 60 },
  // General API: 100 per minute per user
  GENERAL: { limit: 100, windowSeconds: 60 },
} as const;
