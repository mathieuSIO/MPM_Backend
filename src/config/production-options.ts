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
        percentage: 20,
    },
} as const;

export type ProductionOption = keyof typeof PRODUCTION_OPTIONS;