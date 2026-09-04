import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import metricsRoutes from "./routes/metrics.routes";

const ALLOWED_ORIGINS = ["http://localhost:5173"]; // our actual frontend, explicit not wildcard

export function createApp() {
  const app = express();

  app.use(helmet());

  app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }));

  app.use((req, res, next) => {
  console.log(`[${process.env.PORT || 4000}] handling ${req.method} ${req.path}`);
  next();
  });

  app.use(express.json({ limit: "100kb" })); // reasonable cap — our actual payloads are small

  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use("/api", generalLimiter, routes);

  app.use(errorHandler);

  return app;
}