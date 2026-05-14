import { stripe } from "../config/stripe.js";

import { NotFoundError, BadRequestError } from "../errors/http-errors.js";

import { OrderRepository } from "../repositories/order.repository.js";
import { PaymentRepository } from "../repositories/payment.repository.js";

import { env } from "../config/env.js";
import { EmailService } from "./email/email.service.js";

export class PaymentService {
    constructor(
        private readonly orderRepository = new OrderRepository(),
        private readonly paymentRepository = new PaymentRepository(),
        private readonly emailService = new EmailService(),
    ) { }

    async createCheckoutSession(orderId: number): Promise<string> {
        const order = await this.orderRepository.findOrderById(orderId);

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

    async handleCheckoutSessionCompleted(
        checkoutSessionId: string,
        paymentIntentId: string
    ): Promise<void> {
        const payment =
            await this.paymentRepository.findPaymentByCheckoutSessionId(
                checkoutSessionId
            );

        if (!payment) {
            throw new NotFoundError("Payment not found");
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

        const order = await this.orderRepository.findOrderById(
            payment.order_id
        );

        if (!order) {
            throw new NotFoundError("Order not found");
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
}