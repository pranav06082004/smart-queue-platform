import { Router } from "express";
import { demandForecast, analytics } from "../controllers/analytics.controller";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.get("/queues/:id/demand-forecast", authenticate, requireRole("STAFF"), demandForecast);
router.get("/queues/:id/analytics", authenticate, requireRole("STAFF"), analytics);

export default router;