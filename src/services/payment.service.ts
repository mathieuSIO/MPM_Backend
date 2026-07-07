import type Stripe from "stripe";

import { stripe } from "../config/stripe.js";

import { NotFoundError, BadRequestError } from "../errors/http-errors.js";

import { OrderRepository } from "../repositories/order.repository.js";
import { PaymentRepository } from "../repositories/payment.repository.js";
import type { OrderMetaPurchaseRow } from "../types/order.repository.types.js";

import { env } from "../config/env.js";
import { EmailService } from "./email/email.service.js";
import { PromoCodeRepository } from "../repositories/promo-code.repository.js";
import {
    sendMetaPurchaseEvent,
    type SendMetaPurchaseEventParams,
} from "./metaConversions.service.js";

type HandleCheckoutSessionCompletedInput = {
    checkoutSessionId: string;
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
    paymentIntentId: string;
};

type CreateCheckoutSessionInput = {
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
    orderId: number;
};

export class PaymentService {
    constructor(
        private readonly orderRepository = new OrderRepository(),
        private readonly paymentRepository = new PaymentRepository(),
        private readonly emailService = new EmailService(),
        private readonly promoCodeRepository = new PromoCodeRepository(),
    ) { }

    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<string> {
        const order = await this.orderRepository.findOrderById(input.orderId);

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        if (order.status !== "pending") {
            throw new BadRequestError(
                "Only pending orders can be paid"
            );
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",

            success_url: `${env.frontendOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url: `${env.frontendOrigin}/checkout/cancel`,

            customer_email: order.customer_email,
            metadata: createCheckoutSessionMetadata(input),

            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "eur",

                        product_data: {
                            name: `Commande #${order.id}`,
                        },

                        unit_amount: order.total_price_cents,
                    },
                },
            ],
        });

        if (!session.id || !session.url) {
            throw new Error("Stripe checkout session creation failed");
        }

        await this.paymentRepository.createPayment({
            orderId: order.id,
            provider: "stripe",
            providerCheckoutSessionId: session.id,
            amountCents: order.total_price_cents,
            currency: "eur",
        });

        return session.url;
    }

    async handleCheckoutSessionCompleted({
        checkoutSessionId,
        clientIpAddress,
        clientUserAgent,
        paymentIntentId,
    }: HandleCheckoutSessionCompletedInput): Promise<void> {
        const payment =
            await this.paymentRepository.findPaymentByCheckoutSessionId(
                checkoutSessionId
            );

        if (!payment) {
            console.warn(`Ignoring Stripe checkout.session.completed webhook: payment not found for session ${checkoutSessionId}`);

            return;
        }

        if (payment.status === "paid") {
            await this.sendMetaPurchaseForPaidOrder(
                createMetaPurchaseInput({
                    clientIpAddress,
                    clientUserAgent,
                    orderId: payment.order_id,
                })
            );
            return;
        }

        await this.paymentRepository.updatePaymentStatusByCheckoutSession({
            providerCheckoutSessionId: checkoutSessionId,
            providerPaymentId: paymentIntentId,
            status: "paid",
        });

        await this.orderRepository.updateOrderStatus(
            payment.order_id,
            "paid"
        );

        await this.sendMetaPurchaseForPaidOrder(
            createMetaPurchaseInput({
                clientIpAddress,
                clientUserAgent,
                orderId: payment.order_id,
            })
        );

        const order = await this.orderRepository.findOrderById(
            payment.order_id
        );

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        if (order.promo_code_id !== null) {
            await this.promoCodeRepository.incrementUsageCount(order.promo_code_id);
        }

        try {
            await this.emailService.sendOrderPaidCustomerEmail({
                customerEmail: order.customer_email,
                customerFirstName: order.customer_first_name,
                orderId: order.id,
                totalPriceCents: order.total_price_cents,
            });

            await this.emailService.sendNewPaidOrderAdminEmail({
                customerEmail: order.customer_email,
                customerFirstName: order.customer_first_name,
                orderId: order.id,
                totalPriceCents: order.total_price_cents,
            });
        } catch (error) {
            console.error(
                "Failed to send transactional emails:",
                error
            );
        }
    }

    private async sendMetaPurchaseForPaidOrder(input: MetaPurchaseInput): Promise<void> {
        const order = await this.orderRepository.findOrderMetaPurchaseById(
            input.orderId
        );

        if (!order || order.status !== "paid") {
            return;
        }

        if (order.meta_purchase_event_sent_at !== null) {
            return;
        }

        const eventParams = createSendMetaPurchaseEventParams({
            clientIpAddress: input.clientIpAddress,
            clientUserAgent: input.clientUserAgent,
            order,
            eventId: input.eventId,
        });

        const isMetaPurchaseEventSent = await sendMetaPurchaseEvent(eventParams);

        if (isMetaPurchaseEventSent) {
            await this.orderRepository.markMetaPurchaseEventSent(order.id);
        }
    }
}

function createCheckoutSessionMetadata(
    input: CreateCheckoutSessionInput
): Stripe.MetadataParam {
    const metadata: Stripe.MetadataParam = {};
    const clientIpAddress = normalizeStripeMetadataValue(input.clientIpAddress);
    const clientUserAgent = normalizeStripeMetadataValue(input.clientUserAgent);

    if (clientIpAddress) {
        metadata.clientIpAddress = clientIpAddress;
    }

    if (clientUserAgent) {
        metadata.clientUserAgent = clientUserAgent;
    }

    return metadata;
}

function normalizeStripeMetadataValue(value: string | null | undefined): string | null {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
        return null;
    }

    return normalizedValue.slice(0, 500);
}

type MetaPurchaseInput = {
    clientIpAddress: string | null;
    clientUserAgent: string | null;
    eventId: string;
    orderId: number;
};

function createMetaPurchaseInput(input: {
    clientIpAddress: string | null | undefined;
    clientUserAgent: string | null | undefined;
    orderId: number;
}): MetaPurchaseInput {
    return {
        clientIpAddress: input.clientIpAddress ?? null,
        clientUserAgent: input.clientUserAgent ?? null,
        eventId: createMetaPurchaseEventId(input.orderId),
        orderId: input.orderId,
    };
}

function createSendMetaPurchaseEventParams(input: {
    clientIpAddress: string | null;
    clientUserAgent: string | null;
    eventId: string;
    order: OrderMetaPurchaseRow;
}): SendMetaPurchaseEventParams {
    return {
        clientIpAddress: input.clientIpAddress,
        clientUserAgent: input.clientUserAgent,
        contentIds: createMetaContentIds(input.order.items),
        email: input.order.customer_email,
        eventId: input.eventId,
        firstName: input.order.customer_first_name,
        lastName: input.order.customer_last_name,
        orderId: input.order.id,
        phone: input.order.customer_phone,
        value: input.order.total_price_cents / 100,
    };
}

function createMetaPurchaseEventId(orderId: number): string {
    return `order-${orderId}`;
}

function createMetaContentIds(
    items: Array<{
        product_id: number | null;
        shop_product_id: number | null;
        shop_product_variant_id: number | null;
    }>
): string[] {
    const contentIds = items
        .map((item) =>
            item.shop_product_id ?? item.product_id ?? item.shop_product_variant_id
        )
        .filter((contentId): contentId is number => contentId !== null);

    return [...new Set(contentIds)].map(String);
}
