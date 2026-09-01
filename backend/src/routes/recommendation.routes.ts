import { Router } from "express";
import { search } from "../controllers/recommendation.controller";

const router = Router();

router.get("/recommendations", search); // public, same as browsing organizations

export default router;