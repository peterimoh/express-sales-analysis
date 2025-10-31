import { Router } from "express";
import { channelController } from "#controllers/v1/channel.controller.js";

const router = Router();

router.get("/mix", channelController.getChannelMix);

export default router;
