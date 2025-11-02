import { Router } from "express";
import { revenueController } from "#controllers/v1/revenue.controller.js";

const router = Router();

router.get("/", revenueController.getTrends);
router.get("/categories", revenueController.getCategories);
router.get("/top-customers", revenueController.getTopCustomers);
router.get("/top-regions", revenueController.getTopRegions);
router.get("/by-country", revenueController.getRevenueByCountry);

export default router;
