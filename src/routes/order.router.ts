import express from "express";
import { OrderController } from "../controllers/order.controller.js";
import { validateBody } from "../middleware/validate-body.middleware.js";
import { createOrderSchema } from "../schemas/order.schema.js";

const orderRouter = express.Router();
const controller = new OrderController();

orderRouter.post("/", validateBody(createOrderSchema),controller.createOrderWithItems.bind(controller));

export default orderRouter;