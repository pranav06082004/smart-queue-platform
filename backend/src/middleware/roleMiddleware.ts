import { Request, Response, NextFunction } from "express";

export function requireRole(...allowedRoles: Array<"CUSTOMER" | "STAFF">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHENTICATED", message: "No user found on request." },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not have permission to perform this action." },
      });
    }

    next();
  };
}