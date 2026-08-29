import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null, // don't keep retrying forever — fail fast, let cache.ts handle it gracefully
  lazyConnect: false,
});

redis.on("error", (err) => {
  console.warn("[redis] connection error (caching disabled for this request):", err.message);
});

redis.on("connect", () => {
  console.log("[redis] connected");
});