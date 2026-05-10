import type { Request, Response } from "express";
import { OrderService } from "../services/order.service.js";
import type { OrderStatus } from "../types/order.types.js";

export class OrderController {
    constructor(private readonly orderService = new OrderService()) { }

    createOrderWithItems = async (req: Request, res: Response): Promise<void> => {
        const input = {
            ...req.body,
            order: {
                ...req.body.order,
                userId: req.user!.userId,
            },
        };

        const result = await this.orderService.createOrderWithItems(input);

        res.status(201).json({
            success: true,
            data: result,
        });
    };

    getMyOrders = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user!.userId;
        const orders = await this.orderService.getUserOrders(userId);

        res.status(200).json({
            success: true,
            data: orders,
        });
    };

    getMyOrderDetails = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user!.userId;
        const orderId = Number(req.params.orderId);

        const order = await this.orderService.getUserOrderDetails(orderId, userId);

        res.status(200).json({
            success: true,
            data: order,
        });
    };

    getAdminOrders = async (_req: Request, res: Response): Promise<void> => {
        const orders = await this.orderService.getAdminOrders();

        res.status(200).json({
            success: true,
            data: orders,
        });
    };

    getAdminOrderDetails = async (req: Request, res: Response): Promise<void> => {
        const orderId = Number(req.params.orderId);

        const order = await this.orderService.getAdminOrderDetails(orderId);

        res.status(200).json({
            success: true,
            data: order,
        });
    };

    updateAdminOrderStatus = async (req: Request, res: Response): Promise<void> => {
        const orderId = Number(req.params.orderId);
        const status = req.body.status as OrderStatus;

        const order = await this.orderService.updateOrderStatus(orderId, status);

        res.status(200).json({
            success: true,
            data: order,
        });
    };

}