import { Request, Response, NextFunction } from "express";
import { getDemandForecastForQueue, getQueueAnalytics } from "../services/analytics.service";
import { QueueError } from "../services/queueOwnership.service";

function handleError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof QueueError) {
    const status = error.code === "FORBIDDEN" ? 403 : 404;
    return res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
  }
  next(error);
}

export async function demandForecast(req: Request, res: Response, next: NextFunction) {
  try {
    const forecast = await getDemandForecastForQueue(req.user!.userId, req.params.id);
    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function analytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getQueueAnalytics(req.user!.userId, req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(error, res, next);
  }
}