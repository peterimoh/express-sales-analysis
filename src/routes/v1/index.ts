import { Router } from "express";
import exampleRoutes from "./example.routes.js";

const router = Router();

// Mount route modules
router.use("/examples", exampleRoutes);

// Add more routes here as you create them
// router.use("/users", userRoutes);
// router.use("/products", productRoutes);

export default router;
