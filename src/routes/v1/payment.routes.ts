import { Router } from "express";
import { paymentController } from "#controllers/v1/payment.controller.js";

const router = Router();

router.get("/", paymentController.getPaymentMethods);

export default router;
