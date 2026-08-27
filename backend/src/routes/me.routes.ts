import { Router } from "express";
import { getMe, getMyOrganizations, getMyQueueEntries } from "../controllers/me.controller";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.get("/auth/me", authenticate, getMe);
router.get("/my/organizations", authenticate, requireRole("STAFF"), getMyOrganizations);
router.get("/my/queue-entries", authenticate, requireRole("CUSTOMER"), getMyQueueEntries);

export default router;