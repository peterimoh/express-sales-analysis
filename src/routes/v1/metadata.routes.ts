import { Router } from "express";
import { metadataController } from "#controllers/v1/metadata.controller.js";
import { authenticate } from "#common/middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /v1/metadata/last-update:
 *   get:
 *     summary: Get last update timestamp for data tables
 *     tags: [Metadata]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last update timestamp retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/last-update", authenticate, metadataController.getLastUpdate);

export default router;
