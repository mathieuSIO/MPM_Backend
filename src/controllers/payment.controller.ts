import type { Request, Response } from "express";

import Stripe from "stripe";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";
import { PaymentService } from "../services/payment.service.js";

export class PaymentController {
    constructor(
        private readonly paymentService = new PaymentService()
    ) { }

    stripeWebhook = async (req: Request, res: Response): Promise<void> => {
        const signature = req.headers["stripe-signature"];

        if (!signature) {
            res.status(400).send("Missing stripe signature");
            return;
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                signature,
                env.stripeWebhookSecret
            );
        } catch (error) {
            console.error("Stripe webhook signature error:", error);
            res.status(400).send("Invalid webhook signature");
            return;
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            await this.paymentService.handleCheckoutSessionCompleted(
                session.id,
                typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : ""
            );
        }

        res.status(200).json({
            received: true,
        });
    };

    createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
        const orderId = Number(req.body.orderId);

        const checkoutUrl =
            await this.paymentService.createCheckoutSession(orderId);

        res.status(200).json({
            success: true,
            data: {
                checkoutUrl,
            },
        });
    };
}