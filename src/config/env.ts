import type { SignOptions } from "jsonwebtoken";

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const requiredEnv = (key: string): string => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

const optionalEnv = (key: string, defaultValue: string): string => {
  const value = process.env[key]?.trim();

  return value && value.length > 0
    ? value
    : defaultValue;
};

const requiredUrlEnv = (key: string): string => {
  const value = requiredEnv(key);

  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${key} is missing or must be a valid URL`);
  }
};

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: requiredEnv("DATABASE_URL"),

  jwtSecret: requiredEnv("JWT_SECRET"),
  jwtExpiresIn: optionalEnv("JWT_EXPIRES_IN", "7d") as JwtExpiresIn,

  frontendOrigin: optionalEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
  apiPublicUrl: optionalEnv("API_PUBLIC_URL", "http://localhost:4000"),

  stripeSecretKey: requiredEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: requiredEnv("STRIPE_WEBHOOK_SECRET"),

  //META
  metaPixelId: process.env.META_PIXEL_ID?.trim() ?? "",
  metaAccessToken: process.env.META_ACCESS_TOKEN?.trim() ?? "",
  metaTestEventCode: process.env.META_TEST_EVENT_CODE?.trim() ?? "",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY?.trim() ?? "",

  //MONDIAL RELAY
  mondialRelayEnseigne: requiredEnv("MONDIAL_RELAY_ENSEIGNE"),
  mondialRelayPrivateKey: requiredEnv("MONDIAL_RELAY_PRIVATE_KEY"),
  mondialRelayApiUrl: process.env.MONDIAL_RELAY_API_URL ? requiredUrlEnv("MONDIAL_RELAY_API_URL") : "https://api.mondialrelay.com/Web_Services.asmx",
  mondialRelayDefaultCountry: optionalEnv("MONDIAL_RELAY_DEFAULT_COUNTRY", "FR").toUpperCase(),
  mondialRelayDefaultAction: optionalEnv("MONDIAL_RELAY_DEFAULT_ACTION", "24R"),
};