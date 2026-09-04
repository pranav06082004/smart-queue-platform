import { Request, Response } from "express";
import { getMetricsSnapshot } from "../utils/metrics";

export function metrics(req: Request, res: Response) {
  res.status(200).json({ success: true, data: getMetricsSnapshot() });
}