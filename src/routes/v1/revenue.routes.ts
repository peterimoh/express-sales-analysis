import { Router } from "express";
import { revenueController } from "#controllers/v1/revenue.controller.js";
import { authenticate } from "#common/middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /v1/revenue:
 *   get:
 *     summary: Get revenue trends over time
 *     tags: [Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-12-31"
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         example: "USA"
 *       - in: query
 *         name: productCategory
 *         schema:
 *           type: string
 *         example: "Electronics"
 *       - in: query
 *         name: marketingChannel
 *         schema:
 *           type: string
 *         example: "Email"
 *       - in: query
 *         name: customerSegment
 *         schema:
 *           type: string
 *         example: "High Value"
 *     responses:
 *       200:
 *         description: Revenue trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueTrendsResponse'
 *       400:
 *         description: Validation error or missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authenticate, revenueController.getTrends);

/**
 * @swagger
 * /v1/revenue/categories:
 *   get:
 *     summary: Get revenue breakdown by product category
 *     tags: [Revenue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-12-31"
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
 *         description: Category revenue data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryRevenueResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/categories", authenticate, revenueController.getCategories);

/**
 * @swagger
 * /v1/revenue/top-customers:
 *   get:
 *     summary: Get top customers by revenue
 *     tags: [Revenue]
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
 *         description: Top customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerRevenueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/top-customers", authenticate, revenueController.getTopCustomers);

/**
 * @swagger
 * /v1/revenue/top-regions:
 *   get:
 *     summary: Get revenue by top regions
 *     tags: [Revenue]
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
 *         description: Top regions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegionRevenueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/top-regions", authenticate, revenueController.getTopRegions);

/**
 * @swagger
 * /v1/revenue/by-country:
 *   get:
 *     summary: Get revenue breakdown by country
 *     tags: [Revenue]
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
 *         description: Country revenue data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountryRevenueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/by-country", authenticate, revenueController.getRevenueByCountry);

/**
 * @swagger
 * /v1/revenue/by-age-range:
 *   get:
 *     summary: Get revenue breakdown by customer age range
 *     tags: [Revenue]
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
 *         description: Age range revenue data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AgeRangeRevenueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/by-age-range",
  authenticate,
  revenueController.getRevenueByAgeRange
);

/**
 * @swagger
 * /v1/revenue/by-gender:
 *   get:
 *     summary: Get revenue breakdown by customer gender
 *     tags: [Revenue]
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
 *         description: Gender revenue data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenderRevenueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/by-gender", authenticate, revenueController.getRevenueByGender);

/**
 * @swagger
 * /v1/revenue/top-skus:
 *   get:
 *     summary: Get top SKUs by revenue
 *     tags: [Revenue]
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
 *         description: Top SKUs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SKURevenueResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/top-skus", authenticate, revenueController.getTopSKUsByRevenue);

export default router;
