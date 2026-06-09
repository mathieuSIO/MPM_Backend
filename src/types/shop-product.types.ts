export type ShopProductRow = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_cents: number;
    image_url: string | null;
    image_storage_key: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
};

export type ShopProduct = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    imageStorageKey: string | null;
};

export type ShopProductVariantRow = {
    id: number;
    shop_product_id: number;
    size_label: string;
    color_name: string;
    color_hex: string | null;
    sku: string | null;
    price_cents: number | null;
    stock_quantity: number;
    is_active: boolean;
    image_url: string | null;
    image_storage_key: string | null;
    created_at: Date;
    updated_at: Date;
};

export type ShopProductVariant = {
    id: number;
    shopProductId: number;
    sizeLabel: string;
    colorName: string;
    colorHex: string | null;
    sku: string | null;
    priceCents: number | null;
    stockQuantity: number;
    isActive: boolean;
    imageUrl: string | null;
    imageStorageKey: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ShopProductImageRow = {
    id: number;
    shop_product_id: number;
    image_url: string;
    image_storage_key: string | null;
    alt_text: string | null;
    display_order: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
};

export type ShopProductImage = {
    id: number;
    shopProductId: number;
    imageUrl: string;
    imageStorageKey: string | null;
    altText: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};