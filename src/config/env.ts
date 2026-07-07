import type { SignOptions } from "jsonwebtoken";

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: requiredEnv("DATABASE_URL"),

  jwtSecret: requiredEnv("JWT_SECRET"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as JwtExpiresIn,

  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

  apiPublicUrl: process.env.API_PUBLIC_URL || "http://localhost:4000",

  stripeSecretKey: requiredEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: requiredEnv("STRIPE_WEBHOOK_SECRET"),

  metaPixelId: process.env.META_PIXEL_ID ?? "",
  metaAccessToken: process.env.META_ACCESS_TOKEN ?? "",
  metaTestEventCode: process.env.META_TEST_EVENT_CODE ?? "",

  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY ?? "", 
};
