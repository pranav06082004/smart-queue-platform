import { redis } from "../config/redis";

const DEFAULT_TTL_SECONDS = 30;

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[cache] read failed for key "${key}", falling back to source:`, (err as Error).message);
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.warn(`[cache] write failed for key "${key}", continuing without cache:`, (err as Error).message);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.warn(`[cache] invalidation failed for key "${key}":`, (err as Error).message);
  }
}