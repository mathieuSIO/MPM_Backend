import { db } from "../db/connection.js";
import { InternalServerError } from "../errors/http-errors.js";
import type { AuthUserRow, CreateAuthUserInput } from "../types/auth.types.js";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<AuthUserRow | null> {
    const result = await db.query<AuthUserRow>(
      `
      SELECT
        id,
        email,
        password_hash,
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
}