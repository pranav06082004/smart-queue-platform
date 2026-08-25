import { Router } from "express";
import healthRoutes from "./health.routes";

const router = Router();

router.use(healthRoutes);
// Future route groups (auth, organizations, queues...) will be added here in later phases.

export default router;