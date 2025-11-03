import { Router } from "express";
import { segmentController } from "#controllers/v1/segment.controller.js";
import { authenticate } from "#common/middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /v1/segments:
 *   get:
 *     summary: Get customer segment performance metrics
 *     tags: [Segments]
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
 *         description: Segment performance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SegmentPerformanceResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, segmentController.getSegmentPerformance);

export default router;
