import type { SignOptions } from "jsonwebtoken";
import { envSchema } from "../schemas/env.schema.js";
import { z } from "zod";

type JwtExpiresIn =
  NonNullable<SignOptions["expiresIn"]>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(`Invalid environment variables:\n${z.prettifyError(parsedEnv.error)}`,);

  throw new Error(
    "Invalid environment configuration"
  );
}

const values = parsedEnv.data;

export const env = {
  port: values.PORT,

  databaseUrl: values.DATABASE_URL,

  jwtSecret: values.JWT_SECRET,
  jwtExpiresIn:
    values.JWT_EXPIRES_IN as JwtExpiresIn,

  frontendOrigin: values.FRONTEND_ORIGIN,
  apiPublicUrl: values.API_PUBLIC_URL,

  stripeSecretKey: values.STRIPE_SECRET_KEY,
  stripeWebhookSecret:
    values.STRIPE_WEBHOOK_SECRET,

  metaPixelId: values.META_PIXEL_ID,
  metaAccessToken: values.META_ACCESS_TOKEN,
  metaTestEventCode: values.META_TEST_EVENT_CODE,

  turnstileSecretKey:
    values.TURNSTILE_SECRET_KEY,

  mondialRelayEnseigne:
    values.MONDIAL_RELAY_ENSEIGNE,

  mondialRelayPrivateKey:
    values.MONDIAL_RELAY_PRIVATE_KEY,

  mondialRelayApiUrl:
    values.MONDIAL_RELAY_API_URL,

  mondialRelayDefaultCountry:
    values.MONDIAL_RELAY_DEFAULT_COUNTRY,

  mondialRelayDefaultAction:
    values.MONDIAL_RELAY_DEFAULT_ACTION,

  relayReminderJobEnabled:
    values.RELAY_REMINDER_JOB_ENABLED,
};