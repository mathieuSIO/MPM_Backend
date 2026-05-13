import express from "express";
import { Router } from "express";

import { PaymentController } from "../controllers/payment.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";

const paymentWebhookRouter = Router();
const paymentController = new PaymentController();

paymentWebhookRouter.post(
    "/",
    express.raw({ type: "application/json" }),
    asyncHandler(paymentController.stripeWebhook)
);

export default paymentWebhookRouter;