import { Router } from "express";
import { customersController } from "#controllers/v1/customers.controller.js";

const router = Router();

router.get("/clv-distribution", customersController.getCLVDistribution);

export default router;
