import { Router } from "express";
import { channelController } from "#controllers/v1/channel.controller.js";

const router = Router();

router.get("/mix", channelController.getChannelMix);
router.get("/performance", channelController.getPerformance);

export default router;
