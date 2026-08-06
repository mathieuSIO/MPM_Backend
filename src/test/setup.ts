import { afterEach, vi } from "vitest";

process.env.DATABASE_URL = "postgres://unit:test@localhost:5432/mpm_test";
process.env.JWT_SECRET = "unit-test-jwt-secret";
process.env.JWT_EXPIRES_IN = "7d";
process.env.STRIPE_SECRET_KEY = "sk_test_unit";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit";
process.env.FRONTEND_ORIGIN = "https://mpm.test";
process.env.MONDIAL_RELAY_ENSEIGNE ??= "BDTEST13";
process.env.MONDIAL_RELAY_PRIVATE_KEY ??= "TestAPI1key";
process.env.MONDIAL_RELAY_API_URL ??= "https://api.mondialrelay.com/Web_Services.asmx";
process.env.MONDIAL_RELAY_DEFAULT_COUNTRY ??= "FR";
process.env.MONDIAL_RELAY_DEFAULT_ACTION ??= "24R";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
