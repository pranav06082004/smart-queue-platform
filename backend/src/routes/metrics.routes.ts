import { Router } from "express";
import { metrics } from "../controllers/metrics.controller";

const router = Router();
router.get("/metrics", metrics);
export default router;