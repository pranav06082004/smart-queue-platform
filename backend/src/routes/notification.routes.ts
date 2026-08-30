import { Router } from "express";
import { list, markOneRead, markAllRead } from "../controllers/notification.controller";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/notifications", authenticate, list);
router.patch("/notifications/:id/read", authenticate, markOneRead);
router.patch("/notifications/read-all", authenticate, markAllRead);

export default router;