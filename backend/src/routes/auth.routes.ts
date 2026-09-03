import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
import { strictLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/auth/register", strictLimiter, register);
router.post("/auth/login", strictLimiter, login);


export default router;