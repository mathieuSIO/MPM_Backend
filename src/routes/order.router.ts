import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { createOrderSchema, estimateShippingSchema } from "../schemas/order.schema.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";

const orderRouter = Router();
const orderController = new OrderController();


orderRouter.post("/", requireAuth, validateBody(createOrderSchema), asyncHandler(orderController.createOrderWithItems));
orderRouter.post("/shipping-estimate", validateBody(estimateShippingSchema), asyncHandler(orderController.estimateShipping));

export default orderRouter;