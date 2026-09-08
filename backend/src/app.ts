import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import { requestIdMiddleware } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";

const ALLOWED_ORIGINS = ["https://smart-queue-platform-lyart.vercel.app", "http://localhost:5173"];

export function createApp() {
  const app = express();

  app.use(helmet());

  app.use(cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }));

  app.use(requestIdMiddleware);
  app.use(requestLogger);

  app.use(express.json({ limit: "100kb" }));

  app.use("/api", generalLimiter, routes);

  app.use(errorHandler);

  return app;
}