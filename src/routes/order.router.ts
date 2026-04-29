import express from "express";
import { OrderController } from "../controllers/order.controller.js";

const orderRouter = express.Router();
const controller = new OrderController();

orderRouter.post("/", controller.createOrderWithItems.bind(controller));

export default orderRouter;