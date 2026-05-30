import { db } from "../db/connection.js";
import { InternalServerError } from "../errors/http-errors.js";
import type {
    PromoCodeRow,
    PromoCodeDiscountType,
} from "../types/promo-code.types.js";

export class PromoCodeRepository {
    async findByCode(code: string): Promise<PromoCodeRow | null> {
        const result = await db.query<PromoCodeRow>(
            `
            SELECT *
            FROM promo_codes
            WHERE code = $1
            LIMIT 1
            `,
            [code]
        );

        return result.rows[0] ?? null;
    }

    async findAll(): Promise<PromoCodeRow[]> {
        const result = await db.query<PromoCodeRow>(
            `
            SELECT *
            FROM promo_codes
            ORDER BY created_at DESC
            `
        );

        return result.rows;
    }

    async create(input: {
        code: string;
        discountType: PromoCodeDiscountType;
        discountValue: number;
        minimumOrderCents?: number;
        maxUses?: number | null;
        startsAt?: Date | null;
        expiresAt?: Date | null;
        isActive?: boolean;
    }): Promise<PromoCodeRow> {
        const result = await db.query<PromoCodeRow>(
            `
            INSERT INTO promo_codes (
                code,
                discount_type,
                discount_value,
                minimum_order_cents,
                max_uses,
                starts_at,
                expires_at,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            `,
            [
                input.code,
                input.discountType,
                input.discountValue,
                input.minimumOrderCents ?? 0,
                input.maxUses ?? null,
                input.startsAt ?? null,
                input.expiresAt ?? null,
                input.isActive ?? true,
            ]
        );

        const promoCode = result.rows[0];

        if (!promoCode) {
            throw new InternalServerError("Promo code creation failed");
        }

        return promoCode;
    }

    async incrementUsageCount(promoCodeId: number): Promise<void> {
        await db.query(
            `
        UPDATE promo_codes
        SET
            current_uses = current_uses + 1,
            updated_at = now()
        WHERE id = $1
        `,
            [promoCodeId]
        );
    }

    async updateStatus(
        promoCodeId: number,
        isActive: boolean
    ): Promise<boolean> {
        const result = await db.query(
            `
        UPDATE promo_codes
        SET
            is_active = $2,
            updated_at = now()
        WHERE id = $1
        `,
            [promoCodeId, isActive]
        );

        return (result.rowCount ?? 0) > 0;
    }
}