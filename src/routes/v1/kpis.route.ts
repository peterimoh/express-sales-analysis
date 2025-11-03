import { Router } from "express";
import { kpisController } from "#controllers/v1/kpis.controller.js";
import { authenticate } from "#common/middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /v1/kpis:
 *   get:
 *     summary: Get key performance indicators (KPIs)
 *     tags: [KPIs]
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
 *         description: KPIs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KPIsResponse'
 *       400:
 *         description: Validation error or missing required parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No KPIs found for the given parameters
 */
router.get("/", authenticate, kpisController.getKPIs);

export default router;
