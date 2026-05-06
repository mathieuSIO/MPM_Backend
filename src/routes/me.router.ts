import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";

const meRouter = Router();
const orderController = new OrderController();

meRouter.get("/orders", requireAuth, asyncHandler(orderController.getMyOrders));
meRouter.get("/orders/:orderId", requireAuth, asyncHandler(orderController.getMyOrderDetails));

export default meRouter;