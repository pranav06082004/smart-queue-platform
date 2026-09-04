import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { recordRequest } from "../utils/metrics";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  logger.info({ requestId: req.requestId, method: req.method, path: req.path }, "request started");

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info(
      { requestId: req.requestId, method: req.method, path: req.path, statusCode: res.statusCode, durationMs },
      "request completed"
    );
    recordRequest(req.path, res.statusCode, durationMs);
  });

  next();
}