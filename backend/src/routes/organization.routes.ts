import { Router } from "express";
import { create, list, getOne, update } from "../controllers/organization.controller";
import { list as listServices, create as createService } from "../controllers/service.controller";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.get("/organizations", list);
router.get("/organizations/:id", getOne);
router.post("/organizations", authenticate, requireRole("STAFF"), create);
router.patch("/organizations/:id", authenticate, requireRole("STAFF"), update);

router.get("/organizations/:id/services", listServices);
router.post("/organizations/:id/services", authenticate, requireRole("STAFF"), createService);

export default router;