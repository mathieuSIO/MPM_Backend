import { Router } from "express";
import express from "express";
import { PaymentController } from "../controllers/payment.controller.js";

import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { optionalAuth } from "../middleware/optional-auth.middleware.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { createOrderSchema } from "../schemas/order.schema.js";

const paymentRouter = Router();

const paymentController = new PaymentController();

paymentRouter.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    asyncHandler(paymentController.stripeWebhook)
);

paymentRouter.post(
    "/checkout-session",
    requireAuth,
    asyncHandler(paymentController.createCheckoutSession)
);

paymentRouter.post(
    "/checkout",
    optionalAuth,
    validateBody(createOrderSchema),
    asyncHandler(paymentController.createCheckout)
);


export default paymentRouter;
