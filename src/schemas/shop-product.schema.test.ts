import { describe, expect, it } from "vitest";

import {
  createShopProductImageSchema,
  createShopProductVariantSchema,
  updateShopProductVariantStatusSchema,
} from "./shop-product.schema.js";

describe("shop product schemas", () => {
  it("accepts shop product variants with stock, image and optional price", () => {
    const result = createShopProductVariantSchema.safeParse({
      colorHex: "#ffffff",
      colorName: "Blanc",
      imageStorageKey: "variants/white-m.png",
      imageUrl: "/uploads/variants/white-m.png",
      isActive: true,
      priceCents: null,
      sizeLabel: "M",
      sku: "TSHIRT-WHITE-M",
      stockQuantity: 8,
    });

    expect(result.success).toBe(true);
  });

  it("rejects variants with negative stock", () => {
    const result = createShopProductVariantSchema.safeParse({
      colorName: "Blanc",
      sizeLabel: "M",
      stockQuantity: -1,
    });

    expect(result.success).toBe(false);
  });

  it("accepts gallery image creation and status update payloads", () => {
    expect(
      createShopProductImageSchema.safeParse({
        altText: "Vue devant",
        displayOrder: 1,
        imageStorageKey: "gallery/front.png",
        imageUrl: "/uploads/gallery/front.png",
        isActive: true,
      }).success
    ).toBe(true);
    expect(
      updateShopProductVariantStatusSchema.safeParse({ isActive: false }).success
    ).toBe(true);
  });
});
