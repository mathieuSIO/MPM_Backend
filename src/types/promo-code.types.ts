export type PromoCodeDiscountType = "percentage" | "fixed_amount";

export type PromoCodeRow = {
    id: number;
    code: string;
    discount_type: PromoCodeDiscountType;
    discount_value: number;
    minimum_order_cents: number;
    max_uses: number | null;
    current_uses: number;
    starts_at: Date | null;
    expires_at: Date | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
};

export type PublicPromoCode = {
    id: number;
    code: string;
    discountType: PromoCodeDiscountType;
    discountValue: number;
    minimumOrderCents: number;
    maxUses: number | null;
    currentUses: number;
    startsAt: Date | null;
    expiresAt: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type ValidatePromoCodeInput = {
    code: string;
    orderSubtotalCents: number;
};

export type ValidatePromoCodeResult = {
    id: number;
    code: string;
    valid: true;
    discountCents: number;
    discountedSubtotalCents: number;
};