import { describe, expect, it } from "vitest";

import {
  createPromoCodeSchema,
  updatePromoCodeStatusSchema,
  validatePromoCodeSchema,
} from "./promo-code.schema.js";

describe("promo code schemas", () => {
  it("normalizes promo code validation code to uppercase", () => {
    const result = validatePromoCodeSchema.parse({
      code: " welcome10 ",
      orderSubtotalCents: 10_000,
    });

    expect(result).toEqual({
      code: "WELCOME10",
      orderSubtotalCents: 10_000,
    });
  });

  it("accepts fixed amount promo code creation", () => {
    const result = createPromoCodeSchema.safeParse({
      code: "SAVE5",
      discountType: "fixed_amount",
      discountValue: 500,
      expiresAt: "2026-12-31T23:59:59.000Z",
      isActive: true,
      minimumOrderCents: 2500,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid status payloads", () => {
    const result = updatePromoCodeStatusSchema.safeParse({
      isActive: "yes",
    });

    expect(result.success).toBe(false);
  });
});
