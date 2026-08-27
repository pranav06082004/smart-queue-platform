import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import organizationRoutes from "./organization.routes";
import serviceRoutes from "./service.routes";
import queueRoutes from "./queue.routes";

const router = Router();

router.use(healthRoutes);
router.use(authRoutes);
router.use(organizationRoutes);
router.use(serviceRoutes);
router.use(queueRoutes);

export default router;