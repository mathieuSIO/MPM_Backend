import { PRODUCTION_OPTIONS } from "../config/production-options.js";
import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { OrderRepository } from "../repositories/order.repository.js";
import type { CreateOrderRepositoryOutput, OrderDetailsRow, OrderSummaryRow } from "../types/order.repository.types.js";
import type { CreateOrderWithItemsServiceInput } from "../types/order.service.types.js";
import type { OrderStatus } from "../types/order.types.js";

export class OrderService {
    constructor(private readonly orderRepository = new OrderRepository()) { }

    async getUserOrders(userId: number): Promise<OrderSummaryRow[]> {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new BadRequestError("Invalid user id");
        }
        return this.orderRepository.findOrdersByUserId(userId);
    }

    async createOrderWithItems(input: CreateOrderWithItemsServiceInput): Promise<CreateOrderRepositoryOutput> {
        this.validateCreateOrderWithItemsInput(input);

        const itemsTotalPriceCents = this.calculateItemsTotalPriceCents(input);
        const productionOption = input.order.productionOption ?? "standard";
        const productionConfig = PRODUCTION_OPTIONS[productionOption];

        const productionPriceCents = Math.round(
            (itemsTotalPriceCents * productionConfig.percentage) / 100
        );

        const totalPriceCents = itemsTotalPriceCents + productionPriceCents;

        return this.orderRepository.createOrderWithItems({
            order: {
                ...input.order,
                totalPriceCents,
                shippingCountry: input.order.shippingCountry ?? "France",
                productionOption,
                productionLabel: productionConfig.label,
                productionPercentage: productionConfig.percentage,
                productionPriceCents,
            },
            items: input.items,
        });
    }

    async getUserOrderDetails(orderId: number, userId: number): Promise<OrderDetailsRow> {
        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new BadRequestError("Invalid order id");
        }

        const order = await this.orderRepository.findOrderDetailsById(orderId, userId);

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        return order;
    }

    private validateCreateOrderWithItemsInput(input: CreateOrderWithItemsServiceInput): void {

        if (!input.order.customerEmail) {
            throw new BadRequestError("Customer email is required");
        }

        if (input.items.length === 0) {
            throw new BadRequestError("Cannot create an order without items");
        }

        for (const item of input.items) {
            if (item.quantity <= 0) {
                throw new BadRequestError("Item quantity must be greater than 0");
            }

            if (item.unitPriceCents <= 0) {
                throw new BadRequestError("Item unit price must be greater than 0");
            }
        }
    }

    private calculateItemsTotalPriceCents(input: CreateOrderWithItemsServiceInput): number {
        return input.items.reduce((total, item) => {
            return total + item.quantity * item.unitPriceCents;
        }, 0);
    }

    async getAdminOrders(): Promise<OrderSummaryRow[]> {
        return this.orderRepository.findAllOrders();
    }

    async getAdminOrderDetails(orderId: number): Promise<OrderDetailsRow> {
        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new BadRequestError("Invalid order id");
        }

        const order = await this.orderRepository.findAdminOrderDetailsById(orderId);

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        return order;
    }

    async updateOrderStatus(orderId: number, status: OrderStatus): Promise<OrderDetailsRow> {
        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new BadRequestError("Invalid order id");
        }

        const existingOrder = await this.orderRepository.findAdminOrderDetailsById(orderId);

        if (!existingOrder) {
            throw new NotFoundError("Order not found");
        }

        await this.orderRepository.updateOrderStatus(orderId, status);

        const updatedOrder = await this.orderRepository.findAdminOrderDetailsById(orderId);

        if (!updatedOrder) {
            throw new NotFoundError("Order not found after update");
        }

        return updatedOrder;
    }

}