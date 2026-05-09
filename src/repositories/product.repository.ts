import { db } from "../db/connection.js";
import type { ProductCatalogItem, ProductReferenceColorRow, ProductReferenceRow, ProductReferenceSizeRow, ProductRow } from "../types/product.repository.types.js";

export class ProductRepository {
    async findActiveProducts(): Promise<ProductCatalogItem[]> {
        const productsResult = await db.query<ProductRow>(
            `
      SELECT
        id,
        slug,
        name,
        type,
        category,
        is_active
      FROM products
      WHERE is_active = true
      ORDER BY id ASC
      `
        );

        const products = productsResult.rows;

        if (products.length === 0) {
            return [];
        }

        const productIds = products.map((product) => product.id);

        const referencesResult = await db.query<ProductReferenceRow>(
            `
      SELECT
        id,
        product_id,
        reference_name,
        supplier_name,
        supplier_reference,
        grammage_gsm,
        material,
        fit,
        description,
        base_price_cents,
        is_active
      FROM product_references
      WHERE is_active = true
        AND product_id = ANY($1::int[])
      ORDER BY id ASC
      `,
            [productIds]
        );

        const references = referencesResult.rows;

        if (references.length === 0) {
            return products.map((product) => ({
                id: product.id,
                slug: product.slug,
                name: product.name,
                type: product.type,
                category: product.category,
                references: [],
            }));
        }

        const referenceIds = references.map((reference) => reference.id);

        const sizesResult = await db.query<ProductReferenceSizeRow>(
            `
      SELECT
        id,
        product_reference_id,
        size_label,
        sort_order,
        is_active
      FROM product_reference_sizes
      WHERE is_active = true
        AND product_reference_id = ANY($1::int[])
      ORDER BY sort_order ASC
      `,
            [referenceIds]
        );

        const colorsResult = await db.query<ProductReferenceColorRow>(
            `
      SELECT
        id,
        product_reference_id,
        color_name,
        color_code,
        swatch_hex,
        is_active
      FROM product_reference_colors
      WHERE is_active = true
        AND product_reference_id = ANY($1::int[])
      ORDER BY id ASC
      `,
            [referenceIds]
        );

        const referencesByProductId = new Map<number, ProductReferenceRow[]>();
        const sizesByReferenceId = new Map<number, ProductReferenceSizeRow[]>();
        const colorsByReferenceId = new Map<number, ProductReferenceColorRow[]>();

        for (const reference of references) {
            const currentReferences =
                referencesByProductId.get(reference.product_id) ?? [];

            currentReferences.push(reference);
            referencesByProductId.set(reference.product_id, currentReferences);
        }

        for (const size of sizesResult.rows) {
            const currentSizes =
                sizesByReferenceId.get(size.product_reference_id) ?? [];

            currentSizes.push(size);
            sizesByReferenceId.set(size.product_reference_id, currentSizes);
        }

        for (const color of colorsResult.rows) {
            const currentColors =
                colorsByReferenceId.get(color.product_reference_id) ?? [];

            currentColors.push(color);
            colorsByReferenceId.set(color.product_reference_id, currentColors);
        }

        return products.map((product) => {
            const productReferences = referencesByProductId.get(product.id) ?? [];

            return {
                id: product.id,
                slug: product.slug,
                name: product.name,
                type: product.type,
                category: product.category,
                references: productReferences.map((reference) => {
                    const referenceSizes = sizesByReferenceId.get(reference.id) ?? [];
                    const referenceColors = colorsByReferenceId.get(reference.id) ?? [];

                    return {
                        id: reference.id,
                        referenceName: reference.reference_name,
                        supplierName: reference.supplier_name,
                        supplierReference: reference.supplier_reference,
                        grammageGsm: reference.grammage_gsm,
                        material: reference.material,
                        fit: reference.fit,
                        description: reference.description,
                        basePriceCents: reference.base_price_cents,
                        sizes: referenceSizes.map((size) => size.size_label),
                        colors: referenceColors.map((color) => ({
                            id: color.id,
                            name: color.color_name,
                            code: color.color_code,
                            swatchHex: color.swatch_hex,
                        })),
                    };
                }),
            };
        });
    }
}