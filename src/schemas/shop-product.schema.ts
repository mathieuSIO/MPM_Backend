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