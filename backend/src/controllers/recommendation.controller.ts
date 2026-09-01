import { Request, Response, NextFunction } from "express";
import { getRecommendations } from "../services/recommendation.service";

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const serviceName = req.query.serviceName as string;
    if (!serviceName) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "serviceName query parameter is required." },
      });
    }

    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

    const results = await getRecommendations({ serviceName, lat, lng });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}