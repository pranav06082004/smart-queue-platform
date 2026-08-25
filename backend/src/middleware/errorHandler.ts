import { Request, Response, NextFunction } from "express";

// Centralized error handler — consistent error shape, no leaked internals.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    },
  });
}