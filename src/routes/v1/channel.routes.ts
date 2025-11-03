import { Router } from "express";
import { channelController } from "#controllers/v1/channel.controller.js";
import { authenticate } from "#common/middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /v1/channels/mix:
 *   get:
 *     summary: Get channel mix analysis
 *     tags: [Channels]
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
 *         description: Channel mix data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelMixResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/mix", authenticate, channelController.getChannelMix);

/**
 * @swagger
 * /v1/channels/performance:
 *   get:
 *     summary: Get detailed channel performance metrics
 *     tags: [Channels]
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
 *         description: Channel performance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChannelPerformanceResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get("/performance", authenticate, channelController.getPerformance);

export default router;
