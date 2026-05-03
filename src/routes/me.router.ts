import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";

const meRouter = Router();
const orderController = new OrderController();

meRouter.get("/orders", orderController.getMyOrders);
meRouter.get("/orders/:orderId", orderController.getMyOrderDetails);

export default meRouter;