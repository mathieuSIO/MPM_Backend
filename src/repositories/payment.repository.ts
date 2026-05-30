import { db } from "../db/connection.js";

import type {
    CreatePaymentRepositoryInput,
    CreatePaymentRepositoryOutput,
    PaymentRow,
    UpdatePaymentStatusBySessionInput,
} from "../types/payment.types.js";

export class PaymentRepository {
    async createPayment(input: CreatePaymentRepositoryInput): Promise<CreatePaymentRepositoryOutput> {
        const result = await db.query<{ id: number }>(
            `
            INSERT INTO payments (
                order_id,
                provider,
                provider_checkout_session_id,
                status,
                amount_cents,
                currency
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
            `,
            [
                input.orderId,
                input.provider,
                input.providerCheckoutSessionId,
                "pending",
                input.amountCents,
                input.currency,
            ]
        );

        const payment = result.rows[0];

        if (!payment) {
            throw new Error("Payment creation failed");
        }

        return payment;
    }

    async updatePaymentStatusByCheckoutSession(
        input: UpdatePaymentStatusBySessionInput
    ): Promise<void> {
        await db.query(
            `
        UPDATE payments
        SET
            status = $1::varchar,
            provider_payment_id = $2,
            paid_at = CASE
                WHEN $1::varchar = 'paid' THEN NOW()
                ELSE paid_at
            END,
            updated_at = NOW()
        WHERE provider_checkout_session_id = $3
        `,
            [
                input.status,
                input.providerPaymentId ?? null,
                input.providerCheckoutSessionId,
            ]
        );
    }


    async findPaymentByCheckoutSessionId(
        checkoutSessionId: string
    ): Promise<PaymentRow | null> {
        const result = await db.query<PaymentRow>(
            `
        SELECT id, order_id, status
        FROM payments
        WHERE provider_checkout_session_id = $1
        `,
            [checkoutSessionId]
        );

        return result.rows[0] ?? null;
    }
}