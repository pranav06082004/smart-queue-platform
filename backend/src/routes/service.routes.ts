import { Router } from "express";
import { update, remove } from "../controllers/service.controller";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.patch("/services/:id", authenticate, requireRole("STAFF"), update);
router.delete("/services/:id", authenticate, requireRole("STAFF"), remove);

export default router;