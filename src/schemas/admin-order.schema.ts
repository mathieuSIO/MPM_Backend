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

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;