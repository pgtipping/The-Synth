import { AIResponse } from './ai/editor-ai';
import { env } from '@/env.mjs';
import { redis } from './redis';

interface CacheItem<T> {
  value: T;
  expiry: number;
}

// Create an in-memory cache for development when Redis is not available
const memoryCache = new Map<string, CacheItem<unknown>>();

interface CacheOptions {
  expirationSeconds?: number;
}

const DEFAULT_EXPIRATION = 60 * 60 * 24; // 24 hours

export class CacheService {
  private generateKey(feature: string, input: string): string {
    return `@synth/ai:${feature}:${Buffer.from(input).toString('base64')}`;
  }

  private async getFromMemory<T>(key: string): Promise<T | null> {
    const item = memoryCache.get(key);
    if (!item) return null;
    if (item.expiry < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return item.value as T;
  }

  private async setToMemory<T>(
    key: string,
    value: T,
    expirationSeconds: number
  ): Promise<void> {
    memoryCache.set(key, {
      value,
      expiry: Date.now() + expirationSeconds * 1000,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (env.UPSTASH_REDIS_REST_URL) {
        const data = await redis.get<T>(key);
        return data;
      } else {
        return this.getFromMemory<T>(key);
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const { expirationSeconds = DEFAULT_EXPIRATION } = options;
      if (env.UPSTASH_REDIS_REST_URL) {
        await redis.set(key, value, { ex: expirationSeconds });
      } else {
        await this.setToMemory(key, value, expirationSeconds);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetchFn();
    await this.set(key, fresh, options);
    return fresh;
  }

  // AI-specific cache methods
  async getCachedAIResponse(
    feature: string,
    input: string
  ): Promise<AIResponse | null> {
    const key = this.generateKey(feature, input);
    return this.get<AIResponse>(key);
  }

  async cacheAIResponse(
    feature: string,
    input: string,
    response: AIResponse,
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.generateKey(feature, input);
    await this.set(key, response, options);
  }

  async getOrFetchAIResponse(
    feature: string,
    input: string,
    fetchFn: () => Promise<AIResponse>,
    options: CacheOptions = {}
  ): Promise<AIResponse> {
    const key = this.generateKey(feature, input);
    return this.getOrSet(key, fetchFn, options);
  }
}

export const cacheService = new CacheService();
