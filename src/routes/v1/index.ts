import { Router } from "express";
import filtersRoutes from "./filters.routes.js";
import kpisRoutes from "./kpis.route.js";
import metadataRoutes from "./metadata.routes.js";
import revenueRoutes from "./revenue.routes.js";
import customerRoutes from "./customer.route.js";
import channelRoutes from "./channel.routes.js";
import marketingRoutes from "./marketing.route.js";
import geographicRoutes from "./geographic.routes.js";
import satisfactionRoutes from "./satisfaction.routes.js";
import paymentRoutes from "./payment.routes.js";
import segmentRoutes from "./segment.routes.js";

const router = Router();

router.use("/filters", filtersRoutes);
router.use("/kpis", kpisRoutes);
router.use("/metadata", metadataRoutes);
router.use("/revenue", revenueRoutes);
router.use("/customers", customerRoutes);
router.use("/channels", channelRoutes);
router.use("/marketing", marketingRoutes);
router.use("/geographic", geographicRoutes);
router.use("/satisfaction", satisfactionRoutes);
router.use("/payment", paymentRoutes);
router.use("/segments", segmentRoutes);
export default router;
