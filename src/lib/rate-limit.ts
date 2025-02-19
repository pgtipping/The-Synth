import { Ratelimit } from '@upstash/ratelimit';
import { env } from '@/env.mjs';
import { redis } from './redis';

// Create a mock rate limiter for development when Redis is not available
const mockRateLimiter = {
  limit: async () => ({
    success: true,
    limit: 10,
    remaining: 10,
    reset: Date.now() + 10000,
  }),
};

// Factory function to create rate limiter
function createRateLimiter() {
  if (typeof window !== 'undefined') {
    return mockRateLimiter;
  }

  return env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '10s'),
        analytics: true,
        prefix: '@synth/ai',
      })
    : mockRateLimiter;
}

// Create a new ratelimiter that allows 10 requests per 10 seconds per user
export const rateLimiter = createRateLimiter();

// Rate limit by feature and user
export async function checkRateLimit(
  identifier: string,
  feature:
    | 'research'
    | 'generate'
    | 'chat'
    | 'image'
    | 'api'
    | 'default' = 'default'
) {
  const key = `${feature}:${identifier}`;
  const { success, limit, remaining, reset } = await rateLimiter.limit(key);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}
