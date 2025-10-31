import { Router } from "express";
import filtersRoutes from "./filters.routes.js";
import kpisRoutes from "./kpis.route.js";
import metadataRoutes from "./metadata.routes.js";
import revenueRoutes from "./revenue.routes.js";
import customerRoutes from "./customer.route.js";
import channelRoutes from "./channel.routes.js";

const router = Router();

router.use("/filters", filtersRoutes);
router.use("/kpis", kpisRoutes);
router.use("/metadata", metadataRoutes);
router.use("/revenue", revenueRoutes);
router.use("/customers", customerRoutes);
router.use("/channels", channelRoutes);

export default router;
