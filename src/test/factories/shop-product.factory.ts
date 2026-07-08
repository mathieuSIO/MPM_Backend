import type {
  ShopProductImageRow,
  ShopProductRow,
  ShopProductVariantRow,
} from "../../types/shop-product.types.js";

const fixedDate = new Date("2026-01-15T10:30:00.000Z");

export function createShopProductRow(
  overrides: Partial<ShopProductRow> = {}
): ShopProductRow {
  return {
    created_at: fixedDate,
    description: "Produit boutique",
    id: 10,
    image_storage_key: "shop/main.png",
    image_url: "/uploads/shop/main.png",
    is_active: true,
    name: "T-shirt boutique",
    price_cents: 2500,
    slug: "t-shirt-boutique",
    updated_at: fixedDate,
    ...overrides,
  };
}

export function createShopProductVariantRow(
  overrides: Partial<ShopProductVariantRow> = {}
): ShopProductVariantRow {
  return {
    color_hex: "#ffffff",
    color_name: "Blanc",
    created_at: fixedDate,
    id: 20,
    image_storage_key: "variants/white-m.png",
    image_url: "/uploads/variants/white-m.png",
    is_active: true,
    price_cents: 2600,
    shop_product_id: 10,
    size_label: "M",
    sku: "TSHIRT-WHITE-M",
    stock_quantity: 8,
    updated_at: fixedDate,
    ...overrides,
  };
}

export function createShopProductImageRow(
  overrides: Partial<ShopProductImageRow> = {}
): ShopProductImageRow {
  return {
    alt_text: "Vue devant",
    created_at: fixedDate,
    display_order: 1,
    id: 30,
    image_storage_key: "gallery/front.png",
    image_url: "/uploads/gallery/front.png",
    is_active: true,
    shop_product_id: 10,
    updated_at: fixedDate,
    ...overrides,
  };
}
