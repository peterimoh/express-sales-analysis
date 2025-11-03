import { Router } from "express";
import { segmentController } from "#controllers/v1/segment.controller.js";

const router = Router();

router.get("/", segmentController.getSegmentPerformance);

export default router;

