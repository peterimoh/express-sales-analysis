import { Router } from "express";
import { marketingController } from "#controllers/v1/marketing.controller.js";

const router = Router();

router.get("/performance", marketingController.getPerformance);
router.get("/cohort-retention", marketingController.getCohortRetention);
router.get("/product-affinities", marketingController.getProductAffinities);
router.get("/discount-impact", marketingController.getDiscountImpact);

export default router;
