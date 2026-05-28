import { db } from "../db/connection.js";
import { InternalServerError } from "../errors/http-errors.js";
import type { AuthUserRow, CreateAuthUserInput, EmailVerificationUserRow, PasswordResetUserRow } from "../types/auth.types.js";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<AuthUserRow | null> {
    const result = await db.query<AuthUserRow>(
      `
      SELECT
        id,
        email,
        password_hash,
        email_verified_at,
        email_verification_token_hash,
        email_verification_expires_at,
        role,
        first_name,
        last_name,
        phone,
        address_line1,
        address_line2,
        postal_code,
        city,
        country,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    );

    return result.rows[0] ?? null;
  }

  async createUser(input: CreateAuthUserInput): Promise<AuthUserRow> {
    const result = await db.query<AuthUserRow>(
      `
      INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        address_line1,
        address_line2,
        postal_code,
        city,
        country
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        email,
        password_hash,
        email_verified_at,
        email_verification_token_hash,
        email_verification_expires_at,
        role,
        first_name,
        last_name,
        phone,
        address_line1,
        address_line2,
        postal_code,
        city,
        country,
        created_at,
        updated_at
      `,
      [
        input.email,
        input.passwordHash,
        input.firstName ?? null,
        input.lastName ?? null,
        input.phone ?? null,
        input.addressLine1 ?? null,
        input.addressLine2 ?? null,
        input.postalCode ?? null,
        input.city ?? null,
        input.country ?? "France",
      ]
    );

    const user = result.rows[0];

    if (!user) {
      throw new InternalServerError("User creation failed");
    }

    return user;
  }

  async savePasswordResetToken(input: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await db.query(
      `
    UPDATE users
    SET
      password_reset_token_hash = $1,
      password_reset_expires_at = $2,
      updated_at = now()
    WHERE id = $3
    `,
      [input.tokenHash, input.expiresAt, input.userId]
    );
  }

  async findUserByPasswordResetTokenHash(
    tokenHash: string
  ): Promise<PasswordResetUserRow | null> {
    const result = await db.query<PasswordResetUserRow>(
      `
    SELECT
      id,
      email,
      first_name,
      password_reset_token_hash,
      password_reset_expires_at
    FROM users
    WHERE password_reset_token_hash = $1
    LIMIT 1
    `,
      [tokenHash]
    );

    return result.rows[0] ?? null;
  }

  async updatePasswordAndClearResetToken(input: {
    userId: number;
    passwordHash: string;
  }): Promise<void> {
    await db.query(
      `
    UPDATE users
    SET
      password_hash = $1,
      password_reset_token_hash = null,
      password_reset_expires_at = null,
      updated_at = now()
    WHERE id = $2
    `,
      [input.passwordHash, input.userId]
    );
  }

  async saveEmailVerificationToken(input: { userId: number; tokenHash: string; expiresAt: Date; }): Promise<void> {
    await db.query(
      `
      UPDATE users
      SET
        email_verification_token_hash = $1,
        email_verification_expires_at = $2,
        updated_at = now()
      WHERE id = $3
    `,
      [input.tokenHash, input.expiresAt, input.userId]
    );
  }

  async findUserByEmailVerificationTokenHash(tokenHash: string): Promise<EmailVerificationUserRow | null> {
    const result = await db.query<EmailVerificationUserRow>(
      `
      SELECT
        id,
        email,
        first_name,
        email_verified_at,
        email_verification_token_hash,
        email_verification_expires_at
      FROM users
      WHERE email_verification_token_hash = $1
      LIMIT 1
    `,
      [tokenHash]
    );

    return result.rows[0] ?? null;
  }

  async markEmailAsVerified(userId: number): Promise<void> {
    await db.query(
      `
      UPDATE users
      SET
        email_verified_at = now(),
        email_verification_token_hash = null,
        email_verification_expires_at = null,
        updated_at = now()
      WHERE id = $1
    `,
      [userId]
    );
  }

}