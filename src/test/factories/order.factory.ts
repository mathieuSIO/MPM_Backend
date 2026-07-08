import type {
  CreateOrderWithItemsInput,
  OrderMetaPurchaseRow,
  OrderSummaryRow,
} from "../../types/order.repository.types.js";
import type { CreateOrderWithItemsServiceInput } from "../../types/order.service.types.js";

const fixedDate = new Date("2026-01-15T10:30:00.000Z");

export function createOrderServiceInput(
  overrides: Partial<CreateOrderWithItemsServiceInput> = {}
): CreateOrderWithItemsServiceInput {
  return {
    items: [
      {
        itemType: "studio",
        productId: 100,
        productName: "T-shirt studio",
        quantity: 2,
        unitPriceCents: 2500,
      },
    ],
    order: {
      customerEmail: "client@mpm.test",
      productionOption: "standard",
    },
    ...overrides,
  };
}

export function createOrderSummaryRow(
  overrides: Partial<OrderSummaryRow> = {}
): OrderSummaryRow {
  return {
    created_at: fixedDate,
    customer_email: "client@mpm.test",
    customer_first_name: "Ada",
    customer_last_name: "Lovelace",
    discount_cents: 0,
    id: 42,
    production_label: "Standard",
    production_option: "standard",
    production_percentage: 0,
    production_price_cents: 0,
    professional_logo_review_enabled: false,
    professional_logo_review_price_cents: 0,
    promo_code: null,
    promo_code_id: null,
    status: "pending",
    total_price_cents: 5000,
    ...overrides,
  };
}

export function createOrderRepositoryInput(
  overrides: Partial<CreateOrderWithItemsInput> = {}
): CreateOrderWithItemsInput {
  return {
    items: [],
    order: {
      customerEmail: "client@mpm.test",
      discountCents: 0,
      productionLabel: "Standard",
      productionOption: "standard",
      productionPercentage: 0,
      productionPriceCents: 0,
      professionalLogoReviewEnabled: false,
      professionalLogoReviewPriceCents: 0,
      shippingCountry: "France",
      totalPriceCents: 0,
    },
    shipping: {
      label: "Mondial Relay",
      method: "mondial_relay",
      priceCents: 490,
      totalWeightGrams: 500,
    },
    ...overrides,
  };
}

export function createOrderMetaPurchaseRow(
  overrides: Partial<OrderMetaPurchaseRow> = {}
): OrderMetaPurchaseRow {
  return {
    customer_email: "client@mpm.test",
    customer_first_name: "Ada",
    customer_last_name: "Lovelace",
    customer_phone: null,
    id: 42,
    items: [
      {
        product_id: 100,
        product_name: "T-shirt studio",
        quantity: 1,
        shop_product_id: null,
        shop_product_variant_id: null,
      },
    ],
    meta_purchase_event_sent_at: null,
    status: "paid",
    total_price_cents: 5000,
    ...overrides,
  };
}
