import { describe, expect, it, vi } from "vitest";

import { NotFoundError } from "../errors/http-errors.js";
import { ShopProductRepository } from "../repositories/shop-product.repository.js";
import {
  createShopProductImageRow,
  createShopProductRow,
  createShopProductVariantRow,
} from "../test/factories/shop-product.factory.js";
import type {
  ShopProductImageRow,
  ShopProductRow,
  ShopProductVariantRow,
} from "../types/shop-product.types.js";
import { ShopProductService } from "./shop-product.service.js";

type ShopProductRepositoryMock = Pick<
  ShopProductRepository,
  "findActiveImagesByProductId" | "findBySlug" | "findVariantsByProductId"
>;

function createRepositoryMock(input: {
  images?: ShopProductImageRow[];
  product?: ShopProductRow | null;
  variants?: ShopProductVariantRow[];
}): ShopProductRepositoryMock {
  return {
    findActiveImagesByProductId: vi.fn(async () => input.images ?? []),
    findBySlug: vi.fn(async () => input.product ?? null),
    findVariantsByProductId: vi.fn(async () => input.variants ?? []),
  };
}

function createService(repository: ShopProductRepositoryMock): ShopProductService {
  return new ShopProductService(repository as unknown as ShopProductRepository);
}

describe("ShopProductService", () => {
  it("maps product, variants and gallery images to public product details", async () => {
    const repository = createRepositoryMock({
      images: [createShopProductImageRow()],
      product: createShopProductRow(),
      variants: [createShopProductVariantRow()],
    });
    const service = createService(repository);

    const product = await service.getProduct("t-shirt-boutique");

    expect(repository.findBySlug).toHaveBeenCalledWith("t-shirt-boutique");
    expect(repository.findVariantsByProductId).toHaveBeenCalledWith(10);
    expect(repository.findActiveImagesByProductId).toHaveBeenCalledWith(10);
    expect(product).toMatchObject({
      id: 10,
      imageStorageKey: "shop/main.png",
      imageUrl: "/uploads/shop/main.png",
      name: "T-shirt boutique",
      priceCents: 2500,
      variants: [
        {
          colorName: "Blanc",
          id: 20,
          imageStorageKey: "variants/white-m.png",
          imageUrl: "/uploads/variants/white-m.png",
          shopProductId: 10,
          sizeLabel: "M",
          sku: "TSHIRT-WHITE-M",
        },
      ],
      images: [
        {
          altText: "Vue devant",
          displayOrder: 1,
          id: 30,
          imageStorageKey: "gallery/front.png",
          imageUrl: "/uploads/gallery/front.png",
        },
      ],
    });
  });

  it("throws when product slug is unknown", async () => {
    const service = createService(createRepositoryMock({ product: null }));

    await expect(service.getProduct("missing")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
