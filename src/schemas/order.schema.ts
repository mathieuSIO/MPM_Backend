import { z } from "zod";

export const createOrderSchema = z.object({
    order: z.object({
        userId: z.number().int().positive().nullable().optional(),
        customerEmail: z.string().email(),
        customerFirstName: z.string().nullable().optional(),
        customerLastName: z.string().nullable().optional(),
        customerPhone: z.string().nullable().optional(),
        shippingAddressLine1: z.string().nullable().optional(),
        shippingAddressLine2: z.string().nullable().optional(),
        shippingPostalCode: z.string().nullable().optional(),
        shippingCity: z.string().nullable().optional(),
        shippingCountry: z.string().nullable().optional(),
    }),
    items: z.array(
        z.object({
            productId: z.number().int().positive(),
            productName: z.string().min(1),
            quantity: z.number().int().positive(),
            unitPriceCents: z.number().int().positive(),
            customization: z.unknown().nullable().optional(),
            finalPreviewUrl: z.string().url().nullable().optional(),
        })
    ).min(1),
});

export type CreateOrderSchemaInput = z.infer<typeof createOrderSchema>;