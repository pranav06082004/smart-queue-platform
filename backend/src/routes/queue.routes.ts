import { Router } from "express";
import * as queueController from "../controllers/queue.controller";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.post("/queues", authenticate, requireRole("STAFF"), queueController.create);

router.get("/queues/:id/status", queueController.status);
router.get("/queues/:id/history", authenticate, requireRole("STAFF"), queueController.history);

router.patch("/queues/:id/open", authenticate, requireRole("STAFF"), queueController.open);
router.patch("/queues/:id/pause", authenticate, requireRole("STAFF"), queueController.pause);
router.patch("/queues/:id/resume", authenticate, requireRole("STAFF"), queueController.resume);
router.patch("/queues/:id/close", authenticate, requireRole("STAFF"), queueController.close);

router.post("/queues/:id/join", authenticate, requireRole("CUSTOMER"), queueController.join);
router.post("/queues/:id/leave", authenticate, requireRole("CUSTOMER"), queueController.leave);
router.get("/queues/:id/my-position", authenticate, requireRole("CUSTOMER"), queueController.myPosition);

router.post("/queues/:id/next", authenticate, requireRole("STAFF"), queueController.next);
router.post("/queues/:id/skip/:entryId", authenticate, requireRole("STAFF"), queueController.skip);
router.post("/queues/:id/complete/:entryId", authenticate, requireRole("STAFF"), queueController.complete);

export default router;