import { z } from "zod";

export const validatePromoCodeSchema = z.object({
    code: z.string().min(1).max(50).trim().toUpperCase(),
    orderSubtotalCents: z.number().int().positive(),
});

export const createPromoCodeSchema = z.object({
    code: z.string().min(1).max(50).trim().toUpperCase(),
    discountType: z.enum(["percentage", "fixed_amount"]),
    discountValue: z.number().int().positive(),
    minimumOrderCents: z.number().int().min(0).optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    startsAt: z.iso.datetime().nullable().optional(),
    expiresAt: z.iso.datetime().nullable().optional(),
    isActive: z.boolean().optional(),
});

export const updatePromoCodeStatusSchema = z.object({
    isActive: z.boolean(),
});

export const updatePromoCodeSchema = createPromoCodeSchema.partial();