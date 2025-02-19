import { Redis } from '@upstash/redis';
import { env } from '@/env.mjs';

// Create a mock Redis implementation for development
const mockRedis = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
  exists: async () => 0,
  incr: async () => 1,
  decr: async () => 0,
  expire: async () => 1,
};

// Initialize Redis instance
let redisInstance: Redis | typeof mockRedis | null = null;

// Export a function to get Redis instance or mock
function initializeRedis() {
  // Always use mock Redis on the client
  if (typeof window !== 'undefined') {
    return mockRedis;
  }

  // Return existing instance if already initialized
  if (redisInstance) {
    return redisInstance;
  }

  // Only attempt to use Redis on the server
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redisInstance = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });
      return redisInstance;
    } catch (error) {
      console.warn(
        'Failed to initialize Redis, using mock implementation:',
        error
      );
      redisInstance = mockRedis;
      return redisInstance;
    }
  }

  console.warn('Redis credentials not found, using mock implementation');
  redisInstance = mockRedis;
  return redisInstance;
}

// Export the Redis instance
export const redis = initializeRedis();
