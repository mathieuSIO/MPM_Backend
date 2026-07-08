import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmailService } from "./email/email.service.js";
import { OrderRepository } from "../repositories/order.repository.js";
import { PaymentRepository } from "../repositories/payment.repository.js";
import { PromoCodeRepository } from "../repositories/promo-code.repository.js";
import {
  createOrderMetaPurchaseRow,
  createOrderSummaryRow,
} from "../test/factories/order.factory.js";
import type {
  OrderMetaPurchaseRow,
  OrderSummaryRow,
} from "../types/order.repository.types.js";
import type {
  PaymentRow,
  UpdatePaymentStatusBySessionInput,
} from "../types/payment.types.js";
import { PaymentService } from "./payment.service.js";

const { sendMetaPurchaseEventMock } = vi.hoisted(() => ({
  sendMetaPurchaseEventMock: vi.fn<() => Promise<boolean>>(),
}));

vi.mock("./metaConversions.service.js", () => ({
  sendMetaPurchaseEvent: sendMetaPurchaseEventMock,
}));

type OrderRepositoryMock = Pick<
  OrderRepository,
  | "findOrderById"
  | "findOrderMetaPurchaseById"
  | "markMetaPurchaseEventSent"
  | "updateOrderStatus"
>;

type PaymentRepositoryMock = Pick<
  PaymentRepository,
  "findPaymentByCheckoutSessionId" | "updatePaymentStatusByCheckoutSession"
>;

type EmailServiceMock = Pick<
  EmailService,
  "sendNewPaidOrderAdminEmail" | "sendOrderPaidCustomerEmail"
>;

type PromoCodeRepositoryMock = Pick<PromoCodeRepository, "incrementUsageCount">;

function createPaymentRow(overrides: Partial<PaymentRow> = {}): PaymentRow {
  return {
    id: 1,
    order_id: 42,
    status: "pending",
    ...overrides,
  };
}

function createOrderRepositoryMock(input: {
  metaOrder?: OrderMetaPurchaseRow | null;
  order?: OrderSummaryRow | null;
} = {}): OrderRepositoryMock {
  return {
    findOrderById: vi.fn(async () => input.order ?? createOrderSummaryRow()),
    findOrderMetaPurchaseById: vi.fn(
      async () => input.metaOrder ?? createOrderMetaPurchaseRow()
    ),
    markMetaPurchaseEventSent: vi.fn(async () => undefined),
    updateOrderStatus: vi.fn(async () => undefined),
  };
}

function createPaymentRepositoryMock(payment: PaymentRow | null): PaymentRepositoryMock {
  return {
    findPaymentByCheckoutSessionId: vi.fn(async () => payment),
    updatePaymentStatusByCheckoutSession: vi.fn(async () => undefined),
  };
}

function createEmailServiceMock(): EmailServiceMock {
  return {
    sendNewPaidOrderAdminEmail: vi.fn(async () => undefined),
    sendOrderPaidCustomerEmail: vi.fn(async () => undefined),
  };
}

function createPromoCodeRepositoryMock(): PromoCodeRepositoryMock {
  return {
    incrementUsageCount: vi.fn(async () => undefined),
  };
}

function createService(input: {
  emailService?: EmailServiceMock;
  orderRepository?: OrderRepositoryMock;
  paymentRepository?: PaymentRepositoryMock;
  promoCodeRepository?: PromoCodeRepositoryMock;
}): PaymentService {
  return new PaymentService(
    input.orderRepository as unknown as OrderRepository,
    input.paymentRepository as unknown as PaymentRepository,
    input.emailService as unknown as EmailService,
    input.promoCodeRepository as unknown as PromoCodeRepository
  );
}

describe("PaymentService", () => {
  beforeEach(() => {
    sendMetaPurchaseEventMock.mockClear();
    sendMetaPurchaseEventMock.mockResolvedValue(true);
  });

  it("marks pending checkout sessions as paid and sends emails once", async () => {
    const orderRepository = createOrderRepositoryMock();
    const paymentRepository = createPaymentRepositoryMock(createPaymentRow());
    const emailService = createEmailServiceMock();
    const promoCodeRepository = createPromoCodeRepositoryMock();
    const service = createService({
      emailService,
      orderRepository,
      paymentRepository,
      promoCodeRepository,
    });

    await service.handleCheckoutSessionCompleted({
      checkoutSessionId: "cs_test_123",
      paymentIntentId: "pi_test_123",
    });

    expect(paymentRepository.updatePaymentStatusByCheckoutSession).toHaveBeenCalledWith({
      providerCheckoutSessionId: "cs_test_123",
      providerPaymentId: "pi_test_123",
      status: "paid",
    } satisfies UpdatePaymentStatusBySessionInput);
    expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(42, "paid");
    expect(emailService.sendOrderPaidCustomerEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendNewPaidOrderAdminEmail).toHaveBeenCalledTimes(1);
  });

  it("does not resend emails or increment promo usage for already paid payments", async () => {
    const orderRepository = createOrderRepositoryMock();
    const paymentRepository = createPaymentRepositoryMock(
      createPaymentRow({ status: "paid" })
    );
    const emailService = createEmailServiceMock();
    const promoCodeRepository = createPromoCodeRepositoryMock();
    const service = createService({
      emailService,
      orderRepository,
      paymentRepository,
      promoCodeRepository,
    });

    await service.handleCheckoutSessionCompleted({
      checkoutSessionId: "cs_test_123",
      paymentIntentId: "pi_test_123",
    });

    expect(paymentRepository.updatePaymentStatusByCheckoutSession).not.toHaveBeenCalled();
    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(emailService.sendOrderPaidCustomerEmail).not.toHaveBeenCalled();
    expect(emailService.sendNewPaidOrderAdminEmail).not.toHaveBeenCalled();
    expect(promoCodeRepository.incrementUsageCount).not.toHaveBeenCalled();
  });

  it("increments promo current uses only when the payment was not already paid", async () => {
    const orderRepository = createOrderRepositoryMock({
      order: createOrderSummaryRow({ promo_code_id: 7 }),
    });
    const paymentRepository = createPaymentRepositoryMock(createPaymentRow());
    const emailService = createEmailServiceMock();
    const promoCodeRepository = createPromoCodeRepositoryMock();
    const service = createService({
      emailService,
      orderRepository,
      paymentRepository,
      promoCodeRepository,
    });

    await service.handleCheckoutSessionCompleted({
      checkoutSessionId: "cs_test_123",
      paymentIntentId: "pi_test_123",
    });

    expect(promoCodeRepository.incrementUsageCount).toHaveBeenCalledWith(7);
  });

  it("keeps Meta purchase webhook idempotent when event was already marked sent", async () => {
    const orderRepository = createOrderRepositoryMock({
      metaOrder: createOrderMetaPurchaseRow({
        meta_purchase_event_sent_at: new Date("2026-01-15T10:30:00.000Z"),
      }),
    });
    const paymentRepository = createPaymentRepositoryMock(
      createPaymentRow({ status: "paid" })
    );
    const service = createService({
      emailService: createEmailServiceMock(),
      orderRepository,
      paymentRepository,
      promoCodeRepository: createPromoCodeRepositoryMock(),
    });

    await service.handleCheckoutSessionCompleted({
      checkoutSessionId: "cs_test_123",
      paymentIntentId: "pi_test_123",
    });

    expect(sendMetaPurchaseEventMock).not.toHaveBeenCalled();
    expect(orderRepository.markMetaPurchaseEventSent).not.toHaveBeenCalled();
  });
});
