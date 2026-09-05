import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";

function rateLimitHandler(req: any, res: any) {
  res.status(429).json({
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
  });
}

function createRedisStore(prefix: string) {
  return new RedisStore({
    sendCommand: (...args: string[]) => (redis as any).call(...args),
    prefix,
  });
}

const isTestEnv = process.env.NODE_ENV === "test";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore("rl:general:"),
  skip: () => isTestEnv, // don't rate-limit during automated tests
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  store: createRedisStore("rl:strict:"),
  skip: () => isTestEnv,
});