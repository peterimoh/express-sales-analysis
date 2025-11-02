import { Router } from "express";
import { marketingController } from "#controllers/v1/marketing.controller.js";

const router = Router();

router.get("/performance", marketingController.getPerformance);

export default router;
