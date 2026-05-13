export type PaymentProvider = "stripe";

export type PaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "cancelled"
    | "refunded";

export type CreatePaymentRepositoryInput = {
    orderId: number;
    provider: PaymentProvider;
    providerCheckoutSessionId: string;
    amountCents: number;
    currency: string;
};

export type CreatePaymentRepositoryOutput = {
    id: number;
};

export type UpdatePaymentStatusBySessionInput = {
    providerCheckoutSessionId: string;
    status: PaymentStatus;
    providerPaymentId?: string | null;
};