export const PRODUCTION_OPTIONS = {
    standard: {
        label: "Standard",
        estimatedDelay: "7 à 10 jours ouvrés",
        percentage: 0,
    },
    rapide: {
        label: "Rapide",
        estimatedDelay: "4 à 6 jours ouvrés",
        percentage: 15,
    },
    premium: {
        label: "Premium",
        estimatedDelay: "2 à 3 jours ouvrés",
        percentage: 30,
    },
} as const;

export const DEFAULT_SHIPPING_METHOD = "mondial_relay";

export const SHIPPING_OPTIONS = {
    mondial_relay: {
        label: "Mondial Relay",
        priceByWeight: [
            { maxWeightGrams: 500, priceCents: 490 },
            { maxWeightGrams: 1000, priceCents: 690 },
            { maxWeightGrams: 2000, priceCents: 890 },
            { maxWeightGrams: 3000, priceCents: 1090 },
            { maxWeightGrams: 5000, priceCents: 1290 },
            { maxWeightGrams: 10000, priceCents: 1690 },
            { maxWeightGrams: 15000, priceCents: 2190 },
            { maxWeightGrams: 20000, priceCents: 2690 },
            { maxWeightGrams: 25000, priceCents: 3290 },
        ],
    },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_OPTIONS;

export function getShippingPriceCents(weightGrams: number): number {
    const bracket = SHIPPING_OPTIONS.mondial_relay.priceByWeight.find(
        (entry) => weightGrams <= entry.maxWeightGrams
    );

    if (!bracket) {
        throw new Error("Unsupported shipping weight");
    }

    return bracket.priceCents;
}

export type ProductionOption = keyof typeof PRODUCTION_OPTIONS;

export const PROFESSIONAL_LOGO_REVIEW_PRICE_CENTS = 1500;