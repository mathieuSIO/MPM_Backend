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

        country: z
            .string()
            .trim()
            .length(2)
            .transform((value) => value.toUpperCase()),

        latitude: optionalNullableCoordinateSchema,
        longitude: optionalNullableCoordinateSchema,
    }),
});

export const orderRelayPointParamsSchema = z.object({
    orderId: z.coerce
        .number()
        .int()
        .positive(),
});

export const selectRelayPointForUserSchema = z.object({
    relayPoint: z.object({
        id: z
            .string()
            .trim()
            .min(1)
            .max(100),

        country: z
            .string()
            .trim()
            .length(2)
            .transform((value) => value.toUpperCase()),
    }),
});