import {
    DEFAULT_SHIPPING_METHOD,
    getShippingPriceCents,
    PRODUCTION_OPTIONS,
    PROFESSIONAL_LOGO_REVIEW_PRICE_CENTS,
    SHIPPING_OPTIONS,
} from "../config/order-options.js";
import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { OrderRepository } from "../repositories/order.repository.js";
import type { CreateOrderRepositoryOutput, OrderDetailsRow, OrderSummaryRow, UpdateOrderShippingInput } from "../types/order.repository.types.js";
import type { CreateOrderWithItemsServiceInput } from "../types/order.service.types.js";
import type { OrderStatus } from "../types/order.types.js";
import { EmailService } from "./email/email.service.js";
import { PromoCodeService } from "./promo-code.service.js";

export class OrderService {
    constructor(
        private readonly orderRepository = new OrderRepository(),
        private readonly promoCodeService = new PromoCodeService(),
        private readonly emailService = new EmailService(),
    ) { }

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

        const professionalLogoReviewEnabled =
            input.order.professionalLogoReviewEnabled ?? false;

        const professionalLogoReviewPriceCents = professionalLogoReviewEnabled
            ? PROFESSIONAL_LOGO_REVIEW_PRICE_CENTS
            : 0;

        const totalWeightGrams = await this.calculateTotalWeightGrams(input);
        const shippingPriceCents = getShippingPriceCents(totalWeightGrams);
        const shippingOption = SHIPPING_OPTIONS[DEFAULT_SHIPPING_METHOD];

        const totalBeforeDiscountCents =
            itemsTotalPriceCents +
            productionPriceCents +
            professionalLogoReviewPriceCents +
            shippingPriceCents;

        let promoCodeId: number | null = null;
        let promoCode: string | null = null;
        let discountCents = 0;

        if (input.promoCode) {
            const promoResult = await this.promoCodeService.validatePromoCode({
                code: input.promoCode,
                orderSubtotalCents: itemsTotalPriceCents,
            });

            promoCodeId = promoResult.id;
            promoCode = promoResult.code;
            discountCents = promoResult.discountCents;
        }

        const totalPriceCents = totalBeforeDiscountCents - discountCents;

        const repositoryItems = input.items.map((item) => {
            const itemType = item.itemType ?? "studio";

            if (itemType === "shop" && typeof item.shopProductId !== "number") {
                throw new BadRequestError("Shop item shopProductId is required");
            }

            if (itemType === "shop" && typeof item.shopProductVariantId !== "number") {
                throw new BadRequestError("Shop item shopProductVariantId is required");
            }

            if (itemType === "studio" && typeof item.productId !== "number") {
                throw new BadRequestError("Studio item productId is required");
            }

            return {
                itemType,
                productId: itemType === "studio" ? item.productId ?? null : null,
                shopProductId: itemType === "shop" ? item.shopProductId ?? null : null,
                shopProductVariantId: itemType === "shop" ? item.shopProductVariantId ?? null : null,
                productName: item.productName,
                quantity: item.quantity,
                unitPriceCents: item.unitPriceCents,
                customization: item.customization ?? null,
                finalPreviewUrl: item.finalPreviewUrl ?? null,
            };
        });



        return this.orderRepository.createOrderWithItems({
            order: {
                ...input.order,
                customerEmail: normalizeCustomerEmail(input.order.customerEmail),
                totalPriceCents,
                shippingCountry: input.order.shippingCountry ?? "France",
                productionOption,
                productionLabel: productionConfig.label,
                productionPercentage: productionConfig.percentage,
                productionPriceCents,
                professionalLogoReviewEnabled,
                professionalLogoReviewPriceCents,
                promoCodeId,
                promoCode,
                discountCents,
            },
            shipping: {
                method: DEFAULT_SHIPPING_METHOD,
                label: shippingOption.label,
                priceCents: shippingPriceCents,
                totalWeightGrams,
            },
            items: repositoryItems,
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

        if (!normalizeCustomerEmail(input.order.customerEmail)) {
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

        if (existingOrder.status === status) {
            return existingOrder;
        }

        await this.orderRepository.updateOrderStatus(orderId, status);

        const updatedOrder = await this.orderRepository.findAdminOrderDetailsById(orderId);

        if (!updatedOrder) {
            throw new NotFoundError("Order not found after update");
        }

        try {
            if (status === "processing") {
                await this.emailService.sendOrderProcessingCustomerEmail({
                    customerEmail: updatedOrder.customer_email,
                    customerFirstName: updatedOrder.customer_first_name,
                    orderId: updatedOrder.id,
                });
            }

            if (status === "cancelled") {
                await this.emailService.sendOrderCancelledCustomerEmail({
                    customerEmail: updatedOrder.customer_email,
                    customerFirstName: updatedOrder.customer_first_name,
                    orderId: updatedOrder.id,
                });
            }
        } catch (error) {
            console.error(`Failed to send order status email for order ${orderId}`, error);
        }

        return updatedOrder;
    }

    async estimateShipping(input: {
        items: {
            itemType?: "studio" | "shop";
            productId?: number | null;
            shopProductId?: number | null;
            quantity: number;
        }[];
    }) {
        const totalWeightGrams = await this.calculateTotalWeightGrams({
            order: {
                customerEmail: "estimate@local.test",
            },
            items: input.items.map((item) => ({
                itemType: item.itemType ?? "studio",
                productId: item.itemType === "shop" ? null : item.productId ?? null,
                shopProductId: item.itemType === "shop" ? item.shopProductId ?? null : null,
                productName: "estimate",
                quantity: item.quantity,
                unitPriceCents: 1,
                customization: null,
                finalPreviewUrl: null,
            })),
        });

        const shippingPriceCents = getShippingPriceCents(totalWeightGrams);
        const shippingOption = SHIPPING_OPTIONS[DEFAULT_SHIPPING_METHOD];

        return {
            shippingMethod: DEFAULT_SHIPPING_METHOD,
            shippingLabel: shippingOption.label,
            totalWeightGrams,
            shippingPriceCents,
        };
    }

    async updateOrderShipping(
        orderId: number,
        input: {
            trackingNumber?: string | null;
            trackingUrl?: string | null;
            status?: "pending" | "label_created" | "shipped" | "delivered" | "failed";
        }
    ): Promise<OrderDetailsRow> {
        if (!Number.isInteger(orderId) || orderId <= 0) {
            throw new BadRequestError("Invalid order id");
        }

        const existingOrder = await this.orderRepository.findAdminOrderDetailsById(orderId);

        if (!existingOrder) {
            throw new NotFoundError("Order not found");
        }

        const updateShippingInput: UpdateOrderShippingInput = {
            orderId,
        };

        if (input.trackingNumber !== undefined) {
            updateShippingInput.trackingNumber = input.trackingNumber;
        }

        if (input.trackingUrl !== undefined) {
            updateShippingInput.trackingUrl = input.trackingUrl;
        }

        if (input.status !== undefined) {
            updateShippingInput.status = input.status;
        }

        await this.orderRepository.updateOrderShipping(updateShippingInput);

        const updatedOrder = await this.orderRepository.findAdminOrderDetailsById(orderId);

        if (!updatedOrder) {
            throw new NotFoundError("Order not found after shipping update");
        }

        const hasJustBeenShipped = existingOrder.shipping_status !== "shipped" && updatedOrder.shipping_status === "shipped";

        if (hasJustBeenShipped) {
            try {
                await this.emailService.sendOrderShippedCustomerEmail({
                    customerEmail: updatedOrder.customer_email,
                    customerFirstName: updatedOrder.customer_first_name,
                    orderId: updatedOrder.id,
                    carrier: updatedOrder.carrier,
                    trackingNumber: updatedOrder.tracking_number,
                    trackingUrl: updatedOrder.tracking_url,
                });
            } catch (error) {
                console.error(
                    `Failed to send shipped email for order ${orderId}`,
                    error
                );
            }
        }

        return updatedOrder;
    }

    //#region Private methods
    private async calculateTotalWeightGrams(input: CreateOrderWithItemsServiceInput): Promise<number> {
        const studioProductIds = input.items
            .filter((item) => (item.itemType ?? "studio") === "studio")
            .map((item) => item.productId)
            .filter((productId): productId is number => typeof productId === "number");

        const weightRows =
            await this.orderRepository.findProductReferenceWeightsByProductIds(studioProductIds);

        const weightByProductId = new Map(
            weightRows.map((row) => [row.product_id, row.weight_grams])
        );

        let totalWeightGrams = 0;

        const shopProductIds = input.items
            .filter((item) => (item.itemType ?? "studio") === "shop")
            .map((item) => item.shopProductId)
            .filter(
                (shopProductId): shopProductId is number =>
                    typeof shopProductId === "number"
            );

        const shopProductWeights =
            await this.orderRepository.findShopProductWeightsByIds(shopProductIds);

        const shopWeightById = new Map(
            shopProductWeights.map((shopProductWeight) => [
                shopProductWeight.id,
                shopProductWeight.weight_grams,
            ])
        );
        for (const item of input.items) {
            const itemType = item.itemType ?? "studio";

            if (itemType === "studio") {
                if (typeof item.productId !== "number") {
                    throw new BadRequestError("Studio item productId is required");
                }

                const weightGrams = weightByProductId.get(item.productId);

                if (!weightGrams) {
                    throw new BadRequestError("Product weight is missing");
                }

                totalWeightGrams += weightGrams * item.quantity;
                continue;
            }

            if (typeof item.shopProductId !== "number") {
                throw new BadRequestError("Shop item shopProductId is required");
            }

            const weightGrams = shopWeightById.get(item.shopProductId);

            if (!weightGrams) {
                throw new BadRequestError("Shop product weight is missing");
            }

            totalWeightGrams += weightGrams * item.quantity;
        }

        if (totalWeightGrams > 25000) {
            throw new BadRequestError("Order exceeds maximum Mondial Relay weight");
        }

        return totalWeightGrams;
    }
    //#endregion

}

function normalizeCustomerEmail(email: string): string {
    return email.trim().toLowerCase();
}
