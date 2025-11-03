import { Router } from "express";
import { marketingController } from "#controllers/v1/marketing.controller.js";
import { authenticate } from "#common/middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /v1/marketing/performance:
 *   get:
 *     summary: Get marketing performance by location
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: productCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: marketingChannel
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerSegment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marketing performance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketingPerformanceResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/performance", authenticate, marketingController.getPerformance);

/**
 * @swagger
 * /v1/marketing/cohort-retention:
 *   get:
 *     summary: Get customer cohort retention analysis
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: productCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: marketingChannel
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerSegment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cohort retention data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CohortRetentionResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/cohort-retention",
  authenticate,
  marketingController.getCohortRetention
);

/**
 * @swagger
 * /v1/marketing/product-affinities:
 *   get:
 *     summary: Get product affinities (products frequently bought together)
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: productCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: marketingChannel
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerSegment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product affinities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductAffinitiesResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/product-affinities",
  authenticate,
  marketingController.getProductAffinities
);

/**
 * @swagger
 * /v1/marketing/discount-impact:
 *   get:
 *     summary: Get impact analysis of discounts on revenue and profit
 *     tags: [Marketing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: productCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: marketingChannel
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerSegment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discount impact analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountImpactResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/discount-impact",
  authenticate,
  marketingController.getDiscountImpact
);

export default router;
