import { Router } from "express";
import { search } from "../controllers/nlSearch.controller";

const router = Router();

router.post("/nl-search", search);

export default router;