import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function checkIdempotency(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

  if (!idempotencyKey) {
    return next(); // idempotency is optional — requests without a key proceed normally
  }

  const existing = await prisma.idempotencyKey.findUnique({ where: { key: idempotencyKey } });

  if (existing) {
    // We've seen this EXACT request before — return the ORIGINAL result,
    // do not re-run the action. This is true idempotency, not just duplicate rejection.
    return res.status(200).json(existing.responseBody as any);
  }

  // Stash the key on the request so the controller can save the response after success.
  (req as any).idempotencyKey = idempotencyKey;
  next();
}

export async function saveIdempotentResponse(req: Request, userId: string, responseBody: unknown) {
  const key = (req as any).idempotencyKey;
  if (!key) return;

  try {
    await prisma.idempotencyKey.create({
      data: { key, userId, responseBody: responseBody as any },
    });
  } catch (err: any) {
    // Race: two requests with the same key arrived at nearly the same time.
    // Harmless — the unique constraint on `key` already prevented a duplicate save.
    if (err?.code !== "P2002") throw err;
  }
}