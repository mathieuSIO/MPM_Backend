import type { Request, Response } from "express";
import { OrderService } from "../services/order.service.js";
import type { CreateOrderWithItemsInput } from "../types/order.repository.types.js";

export class OrderController {
    constructor(private readonly orderService = new OrderService()) { }

    async createOrderWithItems(req: Request, res: Response) {
        try {
            const result = await this.orderService.createOrderWithItems(req.body as CreateOrderWithItemsInput);
            res.status(201).json({
                success: true,
                data: result,
            });

        } catch (err) {
            console.log("Error creating order:", err);
            res.status(500).json({
                success: false,
                message: "Failed to create order"
            });
        }
    }
}