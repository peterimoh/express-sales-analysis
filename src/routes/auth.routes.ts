import { Router } from "express";
import { authController } from "#controllers/auth.controller.js";
import { authenticate, authorize, checkPasswordResetRequired } from "#common/middleware/auth.js";

const router = Router();

// Public routes
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.post("/reset-password", authenticate, checkPasswordResetRequired, authController.resetPassword);

// Super admin only routes
router.post("/admins", authenticate, authorize("super_admin"), authController.createAdmin);

export default router;

