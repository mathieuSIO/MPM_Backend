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

    created_at: Date;
    updated_at: Date;
};

export type ShopProductVariant = {
    id: number;

    sizeLabel: string;
    colorName: string;
    colorHex: string | null;

    sku: string | null;

    priceCents: number | null;

    stockQuantity: number;

    isActive: boolean;
};