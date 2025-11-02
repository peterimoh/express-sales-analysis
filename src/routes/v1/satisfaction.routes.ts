import { Router } from "express";
import { satisfactionController } from "#controllers/v1/satisfaction.controller.js";

const router = Router();

router.get("/", satisfactionController.getSatisfaction);
router.get("/nps-distribution", satisfactionController.getNPSDistribution);
router.get("/csat-distribution", satisfactionController.getCSATDistribution);

export default router;
