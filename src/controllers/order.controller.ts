import type { Request, Response } from "express";
import { OrderService } from "../services/order.service.js";

export class OrderController {
    constructor(private readonly orderService = new OrderService()) { }

    createOrderWithItems = async (req: Request, res: Response): Promise<void> => {
        const input = req.body;

        const result = await this.orderService.createOrderWithItems(input);

        res.status(201).json({
            success: true,
            data: result,
        });
    };

    getMyOrders = async (req: Request, res: Response): Promise<void> => {
        const userId = 1; // TODO: remplacer par req.user.id quand l'auth sera en place

        const orders = await this.orderService.getUserOrders(userId);

        res.status(200).json({
            success: true,
            data: orders,
        });
    };

    getMyOrderDetails = async (req: Request, res: Response): Promise<void> => {
        const userId = 1; // TODO auth
        const orderId = Number(req.params.orderId);

        const order = await this.orderService.getUserOrderDetails(orderId, userId);

        res.status(200).json({
            success: true,
            data: order,
        });
    };

}