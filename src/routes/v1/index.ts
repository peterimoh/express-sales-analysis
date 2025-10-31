import { Router } from "express";
import filtersRoutes from "./filters.routes.js";
import kpisRoutes from "./kpis.route.js";
import metadataRoutes from "./metadata.routes.js";

const router = Router();

router.use("/filters", filtersRoutes);
router.use("/kpis", kpisRoutes);
router.use("/metadata", metadataRoutes);

export default router;
