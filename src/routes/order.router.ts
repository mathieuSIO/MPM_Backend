import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { createOrderSchema } from "../schemas/order.schema.js";

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.post("/", validateBody(createOrderSchema), orderController.createOrderWithItems);

export default orderRouter;