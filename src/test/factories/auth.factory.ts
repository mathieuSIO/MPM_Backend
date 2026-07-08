import type {
  AuthUserRow,
  EmailVerificationUserRow,
  PasswordResetUserRow,
} from "../../types/auth.types.js";

const fixedDate = new Date("2026-01-15T10:30:00.000Z");

export function createAuthUserRow(
  overrides: Partial<AuthUserRow> = {}
): AuthUserRow {
  return {
    address_line1: null,
    address_line2: null,
    city: null,
    country: "France",
    created_at: fixedDate,
    email: "client@mpm.test",
    email_verification_expires_at: null,
    email_verification_token_hash: null,
    email_verified_at: fixedDate,
    first_name: "Ada",
    id: 7,
    last_name: "Lovelace",
    password_hash: "hashed-existing-password",
    phone: null,
    postal_code: null,
    role: "user",
    updated_at: fixedDate,
    ...overrides,
  };
}

export function createEmailVerificationUserRow(
  overrides: Partial<EmailVerificationUserRow> = {}
): EmailVerificationUserRow {
  return {
    email: "client@mpm.test",
    email_verification_expires_at: new Date("2026-01-16T10:30:00.000Z"),
    email_verification_token_hash: "verification-token-hash",
    email_verified_at: null,
    first_name: "Ada",
    id: 7,
    ...overrides,
  };
}

export function createPasswordResetUserRow(
  overrides: Partial<PasswordResetUserRow> = {}
): PasswordResetUserRow {
  return {
    email: "client@mpm.test",
    first_name: "Ada",
    id: 7,
    password_reset_expires_at: new Date("2026-01-15T11:30:00.000Z"),
    password_reset_token_hash: "reset-token-hash",
    ...overrides,
  };
}
