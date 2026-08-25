import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export async function getHealth(req: Request, res: Response, next: NextFunction) {
  try {
    // Proves the DB connection is actually alive, not just configured.
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}