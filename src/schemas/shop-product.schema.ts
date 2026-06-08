import { z } from "zod";

export const createShopProductSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().nullable().optional(),
    priceCents: z.number().int().min(0),
    imageUrl: z.string().nullable().optional(),
    imageStorageKey: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const updateShopProductSchema = createShopProductSchema.partial();

export const updateShopProductStatusSchema = z.object({
    isActive: z.boolean(),
});

export const createShopProductVariantSchema = z.object({
    sizeLabel: z.string().min(1).max(20),
    colorName: z.string().min(1).max(100),
    colorHex: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    priceCents: z.number().int().min(0).nullable().optional(),
    stockQuantity: z.number().int().min(0),
    imageUrl: z.string().nullable().optional(),
    imageStorageKey: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const updateShopProductVariantSchema =
    createShopProductVariantSchema.partial();

export const updateShopProductVariantStatusSchema = z.object({
    isActive: z.boolean(),
});