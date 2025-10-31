import { Router } from "express";
import { exampleController } from "#controllers/v1/example.controller.js";

const router = Router();

// GET /api/v1/examples
router.get("/", exampleController.findAll);

// GET /api/v1/examples/:id
router.get("/:id", exampleController.findById);

// POST /api/v1/examples
router.post("/", exampleController.create);

// PUT /api/v1/examples/:id
router.put("/:id", exampleController.update);

// DELETE /api/v1/examples/:id
router.delete("/:id", exampleController.delete);

export default router;
