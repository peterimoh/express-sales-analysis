import { Router } from "express";
import { metadataController } from "#controllers/v1/metadata.controller.js";

const router = Router();

router.get("/last-update", metadataController.getLastUpdate);

export default router;
