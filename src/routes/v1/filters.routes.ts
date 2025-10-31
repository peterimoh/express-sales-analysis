import { Router } from "express";
import { filtersController } from "#controllers/v1/filters.controller.js";

const router = Router();

router.get("/", filtersController.getFilters);

export default router;
