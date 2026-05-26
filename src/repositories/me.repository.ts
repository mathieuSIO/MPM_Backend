import { db } from "../db/connection.js";
import { InternalServerError } from "../errors/http-errors.js";
import type { MeUserRow, UpdateMeInput } from "../types/me.types.js";

export class MeRepository {
    async findById(userId: number): Promise<MeUserRow | null> {
        const result = await db.query<MeUserRow>(
            `
            SELECT
                id,
                email,
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
            WHERE id = $1
            LIMIT 1
            `,
            [userId]
        );

        return result.rows[0] ?? null;
    }

    async updateProfile(
        userId: number,
        input: UpdateMeInput
    ): Promise<MeUserRow> {
        const result = await db.query<MeUserRow>(
            `
            UPDATE users
            SET
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                address_line1 = COALESCE($4, address_line1),
                address_line2 = COALESCE($5, address_line2),
                postal_code = COALESCE($6, postal_code),
                city = COALESCE($7, city),
                country = COALESCE($8, country),
                updated_at = now()
            WHERE id = $9
            RETURNING
                id,
                email,
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
                input.firstName ?? null,
                input.lastName ?? null,
                input.phone ?? null,
                input.addressLine1 ?? null,
                input.addressLine2 ?? null,
                input.postalCode ?? null,
                input.city ?? null,
                input.country ?? null,
                userId,
            ]
        );

        const user = result.rows[0];

        if (!user) {
            throw new InternalServerError("User update failed");
        }

        return user;
    }

    async findPasswordHashById(
        userId: number
    ): Promise<{ password_hash: string | null } | null> {
        const result = await db.query<{ password_hash: string | null }>(
            `
            SELECT password_hash
            FROM users
            WHERE id = $1
            LIMIT 1
            `,
            [userId]
        );

        return result.rows[0] ?? null;
    }

    async updatePassword(userId: number, passwordHash: string): Promise<void> {
        await db.query(
            `
            UPDATE users
            SET
                password_hash = $1,
                updated_at = now()
            WHERE id = $2
            `,
            [passwordHash, userId]
        );
    }
}