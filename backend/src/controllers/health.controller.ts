import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { redis } from "../config/redis";
import { getChannel } from "../config/rabbitmq";
import { env } from "../config/env";

async function checkPostgres() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  } catch (err) {
    return { status: "down", error: (err as Error).message };
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return { status: "ok" };
  } catch (err) {
    return { status: "down", error: (err as Error).message };
  }
}

async function checkRabbitMQ() {
  try {
    await getChannel();
    return { status: "ok" };
  } catch (err) {
    return { status: "down", error: (err as Error).message };
  }
}

async function checkAiService() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${env.aiServiceUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok ? { status: "ok" } : { status: "down" };
  } catch (err) {
    return { status: "down", error: (err as Error).message };
  }
}

export async function getHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const [postgres, redisCheck, rabbitmq, aiService] = await Promise.all([
      checkPostgres(),
      checkRedis(),
      checkRabbitMQ(),
      checkAiService(),
    ]);

    const allCriticalOk = postgres.status === "ok" && redisCheck.status === "ok";
    // AI service and RabbitMQ are non-critical, by design (Phases 9/11's fail-open philosophy) —
    // the app stays "ok" overall even if they're down, but we report their status honestly.

    res.status(allCriticalOk ? 200 : 503).json({
      success: true,
      data: {
        status: allCriticalOk ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        dependencies: { postgres, redis: redisCheck, rabbitmq, aiService },
      },
    });
  } catch (error) {
    next(error);
  }
}