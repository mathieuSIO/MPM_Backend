import { z } from "zod";

export const updateMeSchema = z.object({
    firstName: z.string().min(1).nullable().optional(),
    lastName: z.string().min(1).nullable().optional(),
    phone: z.string().min(1).nullable().optional(),
    addressLine1: z.string().min(1).nullable().optional(),
    addressLine2: z.string().nullable().optional(),
    postalCode: z.string().min(1).nullable().optional(),
    city: z.string().min(1).nullable().optional(),
    country: z.string().min(1).nullable().optional(),
});

export const changeMePasswordSchema = z.object({
    currentPassword: z.string().min(1, {
        message: "Current password is required",
    }),
    newPassword: z.string().min(8, {
        message: "New password must contain at least 8 characters",
    }),
});