import { beforeEach, describe, expect, it, vi } from "vitest";

import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { PromoCodeRepository } from "../repositories/promo-code.repository.js";
import { createPromoCodeRow } from "../test/factories/promo-code.factory.js";
import type { PromoCodeRow } from "../types/promo-code.types.js";
import { PromoCodeService } from "./promo-code.service.js";

type PromoCodeRepositoryMock = Pick<PromoCodeRepository, "findByCode">;

function createRepositoryMock(row: PromoCodeRow | null): PromoCodeRepositoryMock {
  return {
    findByCode: vi.fn(async () => row),
  };
}

function createService(repository: PromoCodeRepositoryMock): PromoCodeService {
  return new PromoCodeService(repository as unknown as PromoCodeRepository);
}

describe("PromoCodeService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:30:00.000Z"));
  });

  it("validates an active percentage promo code", async () => {
    const repository = createRepositoryMock(
      createPromoCodeRow({
        code: "WELCOME10",
        discount_type: "percentage",
        discount_value: 10,
      })
    );
    const service = createService(repository);

    const result = await service.validatePromoCode({
      code: " welcome10 ",
      orderSubtotalCents: 12_000,
    });

    expect(repository.findByCode).toHaveBeenCalledWith("WELCOME10");
    expect(result).toEqual({
      code: "WELCOME10",
      discountCents: 1200,
      discountedSubtotalCents: 10_800,
      id: 1,
      valid: true,
    });
  });

  it("caps fixed amount discounts to the subtotal", async () => {
    const service = createService(
      createRepositoryMock(
        createPromoCodeRow({
          discount_type: "fixed_amount",
          discount_value: 5000,
        })
      )
    );

    const result = await service.validatePromoCode({
      code: "WELCOME10",
      orderSubtotalCents: 3000,
    });

    expect(result.discountCents).toBe(3000);
    expect(result.discountedSubtotalCents).toBe(0);
  });

  it("rejects missing promo codes", async () => {
    const service = createService(createRepositoryMock(null));

    await expect(
      service.validatePromoCode({
        code: "MISSING",
        orderSubtotalCents: 10_000,
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects inactive, expired, future and minimum-not-reached promo codes", async () => {
    const cases = [
      createPromoCodeRow({ is_active: false }),
      createPromoCodeRow({ expires_at: new Date("2026-01-01T00:00:00.000Z") }),
      createPromoCodeRow({ starts_at: new Date("2026-02-01T00:00:00.000Z") }),
      createPromoCodeRow({ minimum_order_cents: 20_000 }),
      createPromoCodeRow({ current_uses: 3, max_uses: 3 }),
    ];

    for (const promoCode of cases) {
      const service = createService(createRepositoryMock(promoCode));

      await expect(
        service.validatePromoCode({
          code: promoCode.code,
          orderSubtotalCents: 10_000,
        })
      ).rejects.toBeInstanceOf(BadRequestError);
    }
  });
});
