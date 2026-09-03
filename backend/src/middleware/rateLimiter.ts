import rateLimit from "express-rate-limit";

function rateLimitHandler(req: any, res: any) {
  res.status(429).json({
    success: false,
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
  });
}

// General limiter: applied to all API routes.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window per IP — generous for normal browsing/polling
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// Strict limiter: applied ONLY to sensitive endpoints (login, register, join).
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});