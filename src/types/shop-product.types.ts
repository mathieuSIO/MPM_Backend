export type ShopProductRow = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_cents: number;
    image_url: string | null;
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
};