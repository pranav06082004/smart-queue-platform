import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  logger.error({ requestId: req.requestId, error: (err as Error).message, stack: (err as Error).stack }, "unhandled error");

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong. Please try again." },
  });
}