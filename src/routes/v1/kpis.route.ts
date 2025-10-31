import { Router } from "express";
import { kpisController } from "#controllers/v1/kpis.controller.js";

const router = Router();

router.get("/", kpisController.getKPIs);

export default router;
