import Redis from "ioredis";
import { env } from "./env";

function createRedisConnection(label: string) {
  const client = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
    lazyConnect: false,
  });

  client.on("error", (err) => {
    console.warn(`[redis:${label}] connection error:`, err.message);
  });

  client.on("connect", () => {
    console.log(`[redis:${label}] connected`);
  });

  return client;
}

// Used for GET/SET/DEL caching (Phase 7).
export const redis = createRedisConnection("cache");

// Dedicated connections for Pub/Sub — cannot be shared with the caching client,
// since a connection that calls SUBSCRIBE can no longer run normal commands.
export const redisPublisher = createRedisConnection("publisher");
export const redisSubscriber = createRedisConnection("subscriber");