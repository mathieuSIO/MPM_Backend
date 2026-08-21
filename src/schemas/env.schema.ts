import { z } from "zod";

const booleanFromEnv = z.enum(["true", "false"]).transform((value) => value === "true");

const optionalTrimmedString = z.string().transform((value) => value.trim()).optional().transform((value) => value ?? "");

export const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().trim().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().trim().min(1).default("7d"),
    FRONTEND_ORIGIN: z.string().trim().pipe(z.url()).prefault("http://localhost:5173"),
    API_PUBLIC_URL: z.string().trim().pipe(z.url()).prefault("http://localhost:4000"),

    STRIPE_SECRET_KEY: z.string().trim().min(1, "STRIPE_SECRET_KEY is required"),
    STRIPE_WEBHOOK_SECRET: z.string().trim().min(1, "STRIPE_WEBHOOK_SECRET is required"),

    META_PIXEL_ID: optionalTrimmedString,
    META_ACCESS_TOKEN: optionalTrimmedString,
    META_TEST_EVENT_CODE: optionalTrimmedString,
    TURNSTILE_SECRET_KEY: optionalTrimmedString,
    
    MONDIAL_RELAY_ENSEIGNE: z.string().trim().min(1, "MONDIAL_RELAY_ENSEIGNE is required"),
    MONDIAL_RELAY_PRIVATE_KEY: z.string().trim().min(1, "MONDIAL_RELAY_PRIVATE_KEY is required"),
    MONDIAL_RELAY_API_URL: z.string().trim().pipe(z.url()).prefault("https://api.mondialrelay.com/Web_Services.asmx"),
    MONDIAL_RELAY_DEFAULT_COUNTRY: z.string().trim().min(2).default("FR").transform((value) => value.toUpperCase()),
    MONDIAL_RELAY_DEFAULT_ACTION: z.string().trim().min(1).default("24R"),
    RELAY_REMINDER_JOB_ENABLED: booleanFromEnv.default(true),
});

export type EnvSchema = z.infer<typeof envSchema>;