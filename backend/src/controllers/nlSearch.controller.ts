import { Request, Response, NextFunction } from "express";
import { searchByNaturalLanguage } from "../services/nlSearch.service";

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const { query, lat, lng } = req.body;

    if (typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "A search query is required." },
      });
    }

    if (query.length > 500) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Query is too long." },
      });
    }

    const result = await searchByNaturalLanguage(
      query,
      typeof lat === "number" ? lat : undefined,
      typeof lng === "number" ? lng : undefined
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}