import { Router } from "express";
import { filtersController } from "#controllers/v1/filters.controller.js";
import { authenticate } from "#common/middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /v1/filters:
 *   get:
 *     summary: Get available filter options for the dashboard
 *     tags: [Filters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filter options retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FiltersResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, filtersController.getFilters);

export default router;
