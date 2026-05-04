import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { asyncHandler } from "../middleware/async-handler.middleware.js";

const meRouter = Router();
const orderController = new OrderController();

meRouter.get("/orders", asyncHandler(orderController.getMyOrders));
meRouter.get("/orders/:orderId", asyncHandler(orderController.getMyOrderDetails));

export default meRouter;