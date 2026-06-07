import { db } from "../db/connection.js";
import type { ShopProductRow, ShopProductVariantRow } from "../types/shop-product.types.js";

export class ShopProductRepository {
    async findAllActive(): Promise<ShopProductRow[]> {
        const result = await db.query<ShopProductRow>(
            `
            SELECT
                id,
                name,
                slug,
                description,
                price_cents,
                image_url,
                image_storage_key,
                is_active,
                created_at,
                updated_at
            FROM shop_products
            WHERE is_active = true
            ORDER BY id DESC
            `
        );

        return result.rows;
    }

    async findBySlug(slug: string): Promise<ShopProductRow | null> {
        const result = await db.query<ShopProductRow>(
            `
            SELECT
                id,
                name,
                slug,
                description,
                price_cents,
                image_url,
                image_storage_key,
                is_active,
                created_at,
                updated_at
            FROM shop_products
            WHERE slug = $1
            AND is_active = true
            LIMIT 1
            `,
            [slug]
        );

        return result.rows[0] ?? null;
    }

    async findAllAdmin(): Promise<ShopProductRow[]> {
        const result = await db.query<ShopProductRow>(
            `
        SELECT *
        FROM shop_products
        ORDER BY created_at DESC
        `
        );

        return result.rows;
    }

    async create(input: {
        name: string;
        slug: string;
        description?: string | null;
        priceCents: number;
        imageUrl?: string | null;
        imageStorageKey?: string | null;
        isActive?: boolean;
    }): Promise<ShopProductRow> {
        const result = await db.query<ShopProductRow>(
            `
        INSERT INTO shop_products (
            name,
            slug,
            description,
            price_cents,
            image_url,
            image_storage_key,
            is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
            [
                input.name,
                input.slug,
                input.description ?? null,
                input.priceCents,
                input.imageUrl ?? null,
                input.imageStorageKey ?? null,
                input.isActive ?? true,
            ]
        );

        return result.rows[0]!;
    }

    async updateById(
        productId: number,
        input: {
            name?: string;
            slug?: string;
            description?: string | null;
            priceCents?: number;
            imageUrl?: string | null;
            imageStorageKey?: string | null;
            isActive?: boolean;
        }
    ): Promise<ShopProductRow | null> {
        const result = await db.query<ShopProductRow>(
            `
        UPDATE shop_products
        SET
            name = COALESCE($1, name),
            slug = COALESCE($2, slug),
            description = COALESCE($3, description),
            price_cents = COALESCE($4, price_cents),
            image_url = COALESCE($5, image_url),
            image_storage_key = COALESCE($6, image_storage_key),
            is_active = COALESCE($7, is_active),
            updated_at = now()
        WHERE id = $8
        RETURNING *
        `,
            [
                input.name ?? null,
                input.slug ?? null,
                input.description ?? null,
                input.priceCents ?? null,
                input.imageUrl ?? null,
                input.imageStorageKey ?? null,
                input.isActive ?? null,
                productId,
            ]
        );

        return result.rows[0] ?? null;
    }

    async updateStatus(productId: number, isActive: boolean): Promise<ShopProductRow | null> {
        const result = await db.query<ShopProductRow>(
            `
        UPDATE shop_products
        SET
            is_active = $1,
            updated_at = now()
        WHERE id = $2
        RETURNING *
        `,
            [isActive, productId]
        );

        return result.rows[0] ?? null;
    }

    async findVariantsByProductId(shopProductId: number): Promise<ShopProductVariantRow[]> {
        const result =
            await db.query<ShopProductVariantRow>(
                `
            SELECT
                id,
                shop_product_id,
                size_label,
                color_name,
                color_hex,
                sku,
                price_cents,
                stock_quantity,
                is_active,
                created_at,
                updated_at
            FROM shop_product_variants
            WHERE shop_product_id = $1
            AND is_active = true
            ORDER BY color_name, size_label
            `,
                [shopProductId]
            );

        return result.rows;
    }
}