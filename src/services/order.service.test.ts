import { describe, expect, it, vi } from "vitest";

import { BadRequestError } from "../errors/http-errors.js";
import { OrderRepository } from "../repositories/order.repository.js";
import { createOrderServiceInput } from "../test/factories/order.factory.js";
import type {
  CreateOrderWithItemsInput,
  ProductReferenceWeightRow,
  ShopProductWeightRow,
} from "../types/order.repository.types.js";
import type { ValidatePromoCodeResult } from "../types/promo-code.types.js";
import { OrderService } from "./order.service.js";
import { PromoCodeService } from "./promo-code.service.js";

type OrderRepositoryMock = Pick<
  OrderRepository,
  | "createOrderWithItems"
  | "findProductReferenceWeightsByProductIds"
  | "findShopProductWeightsByIds"
>;

type PromoCodeServiceMock = Pick<PromoCodeService, "validatePromoCode">;

function createOrderRepositoryMock(input: {
  shopWeights?: ShopProductWeightRow[];
  studioWeights?: ProductReferenceWeightRow[];
} = {}): OrderRepositoryMock {
  return {
    createOrderWithItems: vi.fn(async () => ({ id: 42 })),
    findProductReferenceWeightsByProductIds: vi.fn(
      async () => input.studioWeights ?? [{ product_id: 100, weight_grams: 200 }]
    ),
    findShopProductWeightsByIds: vi.fn(
      async () => input.shopWeights ?? [{ id: 10, weight_grams: 300 }]
    ),
  };
}

function createPromoCodeServiceMock(
  result?: ValidatePromoCodeResult
): PromoCodeServiceMock {
  return {
    validatePromoCode: vi.fn(async () => ({
      code: "WELCOME10",
      discountCents: 500,
      discountedSubtotalCents: 4500,
      id: 1,
      valid: true,
      ...result,
    })),
  };
}

function createService(input: {
  orderRepository?: OrderRepositoryMock;
  promoCodeService?: PromoCodeServiceMock;
} = {}): OrderService {
  return new OrderService(
    (input.orderRepository ?? createOrderRepositoryMock()) as unknown as OrderRepository,
    (input.promoCodeService ?? createPromoCodeServiceMock()) as unknown as PromoCodeService
  );
}

function getCreatedOrderInput(repository: OrderRepositoryMock): CreateOrderWithItemsInput {
  const mock = vi.mocked(repository.createOrderWithItems);
  const firstCall = mock.mock.calls[0];

  if (!firstCall) {
    throw new Error("Expected createOrderWithItems to be called");
  }

  return firstCall[0];
}

describe("OrderService", () => {
  it("creates a studio order with computed weight, shipping and itemType", async () => {
    const repository = createOrderRepositoryMock({
      studioWeights: [{ product_id: 100, weight_grams: 250 }],
    });
    const service = createService({ orderRepository: repository });

    await service.createOrderWithItems(createOrderServiceInput());

    const createdOrder = getCreatedOrderInput(repository);
    expect(createdOrder.items).toEqual([
      {
        customization: null,
        finalPreviewUrl: null,
        itemType: "studio",
        productId: 100,
        productName: "T-shirt studio",
        quantity: 2,
        shopProductId: null,
        shopProductVariantId: null,
        unitPriceCents: 2500,
      },
    ]);
    expect(createdOrder.shipping).toMatchObject({
      priceCents: 490,
      totalWeightGrams: 500,
    });
  });

  it("creates a shop order with shop product and variant identifiers", async () => {
    const repository = createOrderRepositoryMock({
      shopWeights: [{ id: 10, weight_grams: 300 }],
    });
    const service = createService({ orderRepository: repository });

    await service.createOrderWithItems(
      createOrderServiceInput({
        items: [
          {
            itemType: "shop",
            productName: "T-shirt boutique",
            quantity: 3,
            shopProductId: 10,
            shopProductVariantId: 20,
            unitPriceCents: 1800,
          },
        ],
      })
    );

    const createdOrder = getCreatedOrderInput(repository);
    expect(repository.findShopProductWeightsByIds).toHaveBeenCalledWith([10]);
    expect(createdOrder.items[0]).toMatchObject({
      itemType: "shop",
      productId: null,
      shopProductId: 10,
      shopProductVariantId: 20,
    });
    expect(createdOrder.shipping.totalWeightGrams).toBe(900);
  });

  it("creates a mixed order and applies promo discount once", async () => {
    const repository = createOrderRepositoryMock({
      shopWeights: [{ id: 10, weight_grams: 300 }],
      studioWeights: [{ product_id: 100, weight_grams: 200 }],
    });
    const promoCodeService = createPromoCodeServiceMock({
      code: "WELCOME10",
      discountCents: 1000,
      discountedSubtotalCents: 7600,
      id: 7,
      valid: true,
    });
    const service = createService({ orderRepository: repository, promoCodeService });

    await service.createOrderWithItems(
      createOrderServiceInput({
        items: [
          {
            itemType: "studio",
            productId: 100,
            productName: "T-shirt studio",
            quantity: 2,
            unitPriceCents: 2500,
          },
          {
            itemType: "shop",
            productName: "T-shirt boutique",
            quantity: 2,
            shopProductId: 10,
            shopProductVariantId: 20,
            unitPriceCents: 1800,
          },
        ],
        promoCode: "welcome10",
      })
    );

    const createdOrder = getCreatedOrderInput(repository);
    expect(promoCodeService.validatePromoCode).toHaveBeenCalledWith({
      code: "welcome10",
      orderSubtotalCents: 8600,
    });
    expect(createdOrder.order).toMatchObject({
      discountCents: 1000,
      promoCode: "WELCOME10",
      promoCodeId: 7,
      totalPriceCents: 8600 + 690 - 1000,
    });
    expect(createdOrder.shipping.totalWeightGrams).toBe(1000);
  });

  it("rejects studio items without productId", async () => {
    const service = createService();

    await expect(
      service.createOrderWithItems(
        createOrderServiceInput({
          items: [
            {
              itemType: "studio",
              productName: "T-shirt studio",
              quantity: 1,
              unitPriceCents: 2500,
            },
          ],
        })
      )
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("rejects shop items without shopProductId", async () => {
    const service = createService();

    await expect(
      service.createOrderWithItems(
        createOrderServiceInput({
          items: [
            {
              itemType: "shop",
              productName: "T-shirt boutique",
              quantity: 1,
              shopProductVariantId: 20,
              unitPriceCents: 1800,
            },
          ],
        })
      )
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
