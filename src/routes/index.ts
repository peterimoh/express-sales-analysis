import { Router } from "express";
import v1Routes from "./v1/index.js";
import authRoutes from "./auth.routes.js";

const router = Router();

// Auth routes (no version prefix)
router.use("/auth", authRoutes);

// API v1 routes
router.use("/v1", v1Routes);

export default router;
