import { Router } from "express";
import filtersRoutes from "./filters.routes.js";
import kpisRoutes from "./kpis.route.js";

const router = Router();

router.use("/filters", filtersRoutes);
router.use("/kpis", kpisRoutes);

export default router;
