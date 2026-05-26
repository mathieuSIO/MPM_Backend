import { z } from "zod";

export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "pending",
        "paid",
        "processing",
        "shipped",
        "completed",
        "cancelled",
    ]),
});

export const updateOrderShippingSchema = z.object({
    trackingNumber: z.string().min(1).nullable().optional(),
    trackingUrl: z.string().url().nullable().optional(),
    status: z
        .enum(["pending", "label_created", "shipped", "delivered", "failed"])
        .optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;