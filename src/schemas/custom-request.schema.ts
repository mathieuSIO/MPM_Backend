import { z } from "zod";

export const createCustomRequestSchema = z.object({
    customerEmail: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
    customerFirstName: z.string().min(1).nullable().optional(),
    customerLastName: z.string().min(1).nullable().optional(),
    customerPhone: z.string().min(1).nullable().optional(),
    message: z.string().min(10, {
        message: "Message must contain at least 10 characters",
    }),
});

export const updateCustomRequestStatusSchema = z.object({
    status: z.enum(["new", "in_progress", "quoted", "closed"]),
});