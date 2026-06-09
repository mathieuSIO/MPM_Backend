import { db } from "../db/connection.js";
import type { ShopProductImageRow, ShopProductRow, ShopProductVariantRow } from "../types/shop-product.types.js";

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
                image_url,
                image_storage_key,
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

    async findAllVariantsByProductId(shopProductId: number): Promise<ShopProductVariantRow[]> {
        const result = await db.query<ShopProductVariantRow>(
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
            image_url,
            image_storage_key,
            is_active,
            created_at,
            updated_at
        FROM shop_product_variants
        WHERE shop_product_id = $1
        ORDER BY color_name ASC, size_label ASC
        `,
            [shopProductId]
        );

        return result.rows;
    }

    async createVariant(
        shopProductId: number,
        input: {
            sizeLabel: string;
            colorName: string;
            colorHex?: string | null;
            sku?: string | null;
            priceCents?: number | null;
            stockQuantity: number;
            imageUrl?: string | null;
            imageStorageKey?: string | null;
            isActive?: boolean;
        }
    ): Promise<ShopProductVariantRow> {
        const result = await db.query<ShopProductVariantRow>(
            `
        INSERT INTO shop_product_variants (
            shop_product_id,
            size_label,
            color_name,
            color_hex,
            sku,
            price_cents,
            stock_quantity,
            image_url,
            image_storage_key,
            is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
            id,
            shop_product_id,
            size_label,
            color_name,
            color_hex,
            sku,
            price_cents,
            stock_quantity,
            image_url,
            image_storage_key,
            is_active,
            created_at,
            updated_at
        `,
            [
                shopProductId,
                input.sizeLabel,
                input.colorName,
                input.colorHex ?? null,
                input.sku ?? null,
                input.priceCents ?? null,
                input.stockQuantity,
                input.imageUrl ?? null,
                input.imageStorageKey ?? null,
                input.isActive ?? true,
            ]
        );

        return result.rows[0]!;
    }

    async updateVariantById(
        shopProductId: number,
        variantId: number,
        input: {
            sizeLabel?: string;
            colorName?: string;
            colorHex?: string | null;
            sku?: string | null;
            priceCents?: number | null;
            stockQuantity?: number;
            imageUrl?: string | null;
            imageStorageKey?: string | null;
            isActive?: boolean;
        }
    ): Promise<ShopProductVariantRow | null> {
        const result = await db.query<ShopProductVariantRow>(
            `
        UPDATE shop_product_variants
        SET
            size_label = COALESCE($1, size_label),
            color_name = COALESCE($2, color_name),
            color_hex = COALESCE($3, color_hex),
            sku = COALESCE($4, sku),
            price_cents = COALESCE($5, price_cents),
            stock_quantity = COALESCE($6, stock_quantity),
            is_active = COALESCE($7, is_active),
            image_url = COALESCE($8, image_url),
            image_storage_key = COALESCE($9, image_storage_key),
            updated_at = now()
        WHERE id = $10
            AND shop_product_id = $11
        RETURNING
            id,
            shop_product_id,
            size_label,
            color_name,
            color_hex,
            sku,
            price_cents,
            stock_quantity,
            image_url,
            image_storage_key,
            is_active,
            created_at,
            updated_at
        `,
            [
                input.sizeLabel ?? null,
                input.colorName ?? null,
                input.colorHex ?? null,
                input.sku ?? null,
                input.priceCents ?? null,
                input.stockQuantity ?? null,
                input.isActive ?? null,
                input.imageUrl ?? null,
                input.imageStorageKey ?? null,
                variantId,
                shopProductId,
            ]
        );

        return result.rows[0] ?? null;
    }

    async updateVariantStatus(
        shopProductId: number,
        variantId: number,
        isActive: boolean
    ): Promise<ShopProductVariantRow | null> {
        const result = await db.query<ShopProductVariantRow>(
            `
        UPDATE shop_product_variants
        SET
            is_active = $1,
            updated_at = now()
        WHERE id = $2
          AND shop_product_id = $3
        RETURNING
            id,
            shop_product_id,
            size_label,
            color_name,
            color_hex,
            sku,
            price_cents,
            stock_quantity,
            image_url,
            image_storage_key,
            is_active,
            created_at,
            updated_at
        `,
            [isActive, variantId, shopProductId]
        );

        return result.rows[0] ?? null;
    }

    async findAllImagesByProductId(
        shopProductId: number
    ): Promise<ShopProductImageRow[]> {
        const result = await db.query<ShopProductImageRow>(
            `
        SELECT
            id,
            shop_product_id,
            image_url,
            image_storage_key,
            alt_text,
            display_order,
            is_active,
            created_at,
            updated_at
        FROM shop_product_images
        WHERE shop_product_id = $1
        ORDER BY display_order ASC, id ASC
        `,
            [shopProductId]
        );

        return result.rows;
    }

    async findActiveImagesByProductId(shopProductId: number): Promise<ShopProductImageRow[]> {
        const result = await db.query<ShopProductImageRow>(
            `
        SELECT
            id,
            shop_product_id,
            image_url,
            image_storage_key,
            alt_text,
            display_order,
            is_active,
            created_at,
            updated_at
        FROM shop_product_images
        WHERE shop_product_id = $1
          AND is_active = true
        ORDER BY display_order ASC, id ASC
        `,
            [shopProductId]
        );

        return result.rows;
    }

    async createImage(
        shopProductId: number,
        input: {
            imageUrl: string;
            imageStorageKey?: string | null;
            altText?: string | null;
            displayOrder?: number;
            isActive?: boolean;
        }
    ): Promise<ShopProductImageRow> {
        const result = await db.query<ShopProductImageRow>(
            `
        INSERT INTO shop_product_images (
            shop_product_id,
            image_url,
            image_storage_key,
            alt_text,
            display_order,
            is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            shop_product_id,
            image_url,
            image_storage_key,
            alt_text,
            display_order,
            is_active,
            created_at,
            updated_at
        `,
            [
                shopProductId,
                input.imageUrl,
                input.imageStorageKey ?? null,
                input.altText ?? null,
                input.displayOrder ?? 0,
                input.isActive ?? true,
            ]
        );

        return result.rows[0]!;
    }

    async updateImageById(
        shopProductId: number,
        imageId: number,
        input: {
            imageUrl?: string;
            imageStorageKey?: string | null;
            altText?: string | null;
            displayOrder?: number;
            isActive?: boolean;
        }
    ): Promise<ShopProductImageRow | null> {
        const result = await db.query<ShopProductImageRow>(
            `
        UPDATE shop_product_images
        SET
            image_url = COALESCE($1, image_url),
            image_storage_key = COALESCE($2, image_storage_key),
            alt_text = COALESCE($3, alt_text),
            display_order = COALESCE($4, display_order),
            is_active = COALESCE($5, is_active),
            updated_at = now()
        WHERE id = $6
          AND shop_product_id = $7
        RETURNING
            id,
            shop_product_id,
            image_url,
            image_storage_key,
            alt_text,
            display_order,
            is_active,
            created_at,
            updated_at
        `,
            [
                input.imageUrl ?? null,
                input.imageStorageKey ?? null,
                input.altText ?? null,
                input.displayOrder ?? null,
                input.isActive ?? null,
                imageId,
                shopProductId,
            ]
        );

        return result.rows[0] ?? null;
    }

    async updateImageStatus(
        shopProductId: number,
        imageId: number,
        isActive: boolean
    ): Promise<ShopProductImageRow | null> {
        const result = await db.query<ShopProductImageRow>(
            `
        UPDATE shop_product_images
        SET
            is_active = $1,
            updated_at = now()
        WHERE id = $2
          AND shop_product_id = $3
        RETURNING
            id,
            shop_product_id,
            image_url,
            image_storage_key,
            alt_text,
            display_order,
            is_active,
            created_at,
            updated_at
        `,
            [isActive, imageId, shopProductId]
        );

        return result.rows[0] ?? null;
    }
}