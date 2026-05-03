import type { Request, Response } from "express";
import { OrderService } from "../services/order.service.js";
import type { CreateOrderWithItemsServiceInput } from "../types/order.service.types.js";

export class OrderController {
    constructor(private readonly orderService = new OrderService()) { }

    createOrderWithItems = async (req: Request, res: Response): Promise<void> => {
        try {
            const result = await this.orderService.createOrderWithItems(req.body as CreateOrderWithItemsServiceInput);
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

    getMyOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = 1; // TODO: remplacer par req.user.id quand l'auth sera en place

            const orders = await this.orderService.getUserOrders(userId);

            res.status(200).json({
                success: true,
                data: orders,
            });
        } catch (err) {
            console.error("Error in getMyOrders:", err);

            res.status(500).json({
                success: false,
                message: "Unable to fetch orders",
            });
        }
    };

    getMyOrderDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = 1; // TODO auth
            const orderId = Number(req.params.orderId);

            const order = await this.orderService.getUserOrderDetails(orderId, userId);

            res.status(200).json({
                success: true,
                data: order,
            });
        } catch (err) {
            console.error("Error in getMyOrderDetails:", err);

            res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
    };

}