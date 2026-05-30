import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { PromoCodeRepository } from "../repositories/promo-code.repository.js";
import type {
    PromoCodeRow,
    PublicPromoCode,
    ValidatePromoCodeInput,
    ValidatePromoCodeResult,
} from "../types/promo-code.types.js";

export class PromoCodeService {
    constructor(
        private readonly promoCodeRepository = new PromoCodeRepository()
    ) { }

    async validatePromoCode(
        input: ValidatePromoCodeInput
    ): Promise<ValidatePromoCodeResult> {
        const code = input.code.trim().toUpperCase();

        const promoCode = await this.promoCodeRepository.findByCode(code);

        if (!promoCode) {
            throw new NotFoundError("Promo code not found");
        }

        this.assertPromoCodeUsable(promoCode, input.orderSubtotalCents);

        const discountCents = this.calculateDiscountCents(
            promoCode,
            input.orderSubtotalCents
        );

        return {
            id: promoCode.id,
            code: promoCode.code,
            valid: true,
            discountCents,
            discountedSubtotalCents: input.orderSubtotalCents - discountCents,
        };
    }

    async getAdminPromoCodes(): Promise<PublicPromoCode[]> {
        const promoCodes = await this.promoCodeRepository.findAll();

        return promoCodes.map((promoCode) => this.toPublicPromoCode(promoCode));
    }

    async createAdminPromoCode(input: {
        code: string;
        discountType: "percentage" | "fixed_amount";
        discountValue: number;
        minimumOrderCents?: number;
        maxUses?: number | null;
        startsAt?: string | null;
        expiresAt?: string | null;
        isActive?: boolean;
    }): Promise<PublicPromoCode> {
        const promoCode = await this.promoCodeRepository.create({
            code: input.code.trim().toUpperCase(),
            discountType: input.discountType,
            discountValue: input.discountValue,
            minimumOrderCents: input.minimumOrderCents ?? 0,
            maxUses: input.maxUses ?? null,
            startsAt: input.startsAt ? new Date(input.startsAt) : null,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            isActive: input.isActive ?? true,
        });

        return this.toPublicPromoCode(promoCode);
    }

    private assertPromoCodeUsable(
        promoCode: PromoCodeRow,
        orderSubtotalCents: number
    ): void {
        const now = new Date();

        if (!promoCode.is_active) {
            throw new BadRequestError("Promo code is inactive");
        }

        if (promoCode.starts_at && promoCode.starts_at > now) {
            throw new BadRequestError("Promo code is not active yet");
        }

        if (promoCode.expires_at && promoCode.expires_at < now) {
            throw new BadRequestError("Promo code has expired");
        }

        if (
            promoCode.max_uses !== null &&
            promoCode.current_uses >= promoCode.max_uses
        ) {
            throw new BadRequestError("Promo code usage limit reached");
        }

        if (orderSubtotalCents < promoCode.minimum_order_cents) {
            throw new BadRequestError("Minimum order amount not reached");
        }
    }

    private calculateDiscountCents(
        promoCode: PromoCodeRow,
        orderSubtotalCents: number
    ): number {
        if (promoCode.discount_type === "percentage") {
            return Math.round(
                (orderSubtotalCents * promoCode.discount_value) / 100
            );
        }

        return Math.min(promoCode.discount_value, orderSubtotalCents);
    }

    private toPublicPromoCode(promoCode: PromoCodeRow): PublicPromoCode {
        return {
            id: promoCode.id,
            code: promoCode.code,
            discountType: promoCode.discount_type,
            discountValue: promoCode.discount_value,
            minimumOrderCents: promoCode.minimum_order_cents,
            maxUses: promoCode.max_uses,
            currentUses: promoCode.current_uses,
            startsAt: promoCode.starts_at,
            expiresAt: promoCode.expires_at,
            isActive: promoCode.is_active,
            createdAt: promoCode.created_at,
            updatedAt: promoCode.updated_at,
        };
    }
}