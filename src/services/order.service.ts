import { OrderRepository } from "../repositories/order.repository.js";
import type { CreateOrderRepositoryOutput, CreateOrderWithItemsInput, OrderSummaryRow } from "../types/order.repository.types.js";

export class OrderService {
    constructor(private readonly orderRepository = new OrderRepository()) { }

    async getUserOrders(userId: number): Promise<OrderSummaryRow[]> {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error("Invalid user id");
        }
        return this.orderRepository.getOrdersByUserId(userId);
    }

    async createOrderWithItems(input: CreateOrderWithItemsInput): Promise<CreateOrderRepositoryOutput> {
        this.validateCreateOrderWithItemsInput(input);

        const totalPriceCents = this.calculateTotalPriceCents(input);

        return this.orderRepository.createOrderWithItems({
            order: {
                ...input.order,
                totalPriceCents,
                shippingCountry: input.order.shippingCountry ?? "France",
            },
            items: input.items,
        });
    }

    private validateCreateOrderWithItemsInput(input: CreateOrderWithItemsInput): void {

        if (!input.order.customerEmail) {
            throw new Error("Customer email is required");
        }
        
        if (input.items.length === 0) {
            throw new Error("Cannot create an order without items");
        }

        for (const item of input.items) {
            if (item.quantity <= 0) {
                throw new Error("Item quantity must be greater than 0");
            }

            if (item.unitPriceCents <= 0) {
                throw new Error("Item unit price must be greater than 0");
            }
        }
    }

    private calculateTotalPriceCents(input: CreateOrderWithItemsInput): number {
        return input.items.reduce((total, item) => {
            return total + item.quantity * item.unitPriceCents;
        }, 0);
    }
}