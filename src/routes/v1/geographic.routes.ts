import { Router } from "express";
import { geographicController } from "#controllers/v1/geographic.controller.js";

const router = Router();

router.get("/regional", geographicController.getRegionalPerformance);

export default router;
