import type { PromoCodeRow } from "../../types/promo-code.types.js";

const fixedDate = new Date("2026-01-15T10:30:00.000Z");

export function createPromoCodeRow(
  overrides: Partial<PromoCodeRow> = {}
): PromoCodeRow {
  return {
    code: "WELCOME10",
    created_at: fixedDate,
    current_uses: 0,
    discount_type: "percentage",
    discount_value: 10,
    expires_at: null,
    id: 1,
    is_active: true,
    max_uses: null,
    minimum_order_cents: 0,
    starts_at: null,
    updated_at: fixedDate,
    ...overrides,
  };
}
