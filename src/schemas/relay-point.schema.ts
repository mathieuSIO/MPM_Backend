import { z } from "zod";

const optionalNullableCoordinateSchema = z
    .number()
    .finite()
    .nullable()
    .optional();

export const selectRelayPointSchema = z.object({
    checkoutSessionId: z
        .string()
        .trim()
        .min(1)
        .max(255),

    relayPoint: z.object({
        id: z
            .string()
            .trim()
            .min(1)
            .max(100),

        name: z
            .string()
            .trim()
            .min(1)
            .max(255),

        addressLine1: z
            .string()
            .trim()
            .min(1)
            .max(255),

        addressLine2: z
            .string()
            .trim()
            .max(255)
            .nullable()
            .optional(),

        postalCode: z
            .string()
            .trim()
            .min(1)
            .max(20),

        city: z
            .string()
            .trim()
            .min(1)
            .max(150),

        country: z
            .string()
            .trim()
            .min(2)
            .max(10),

        latitude: optionalNullableCoordinateSchema,
        longitude: optionalNullableCoordinateSchema,
    }),
});