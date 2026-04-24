import type { CreateDevisInput, CreateDevisLineInput } from "../types/createDevisInputType.js";
import type { DevisLine } from "../types/devisLineType.js";
import type { Devis } from "../types/devisType.js";
import type { ProductType } from "../types/productType.js";

export async function createDevis(devisInput: CreateDevisInput): Promise<Devis> {

    const lines = buildDevisLines(devisInput.lines);
    const totalPrice = calculateTotalDevisPrice(lines);

    const devis: Devis = {
        lines,
        totalPrice
    };

    console.log("voici le nouveau devis : ", devis)

    //Code qui insere mon devis en base

    //retour de ma requete

    return devis;
}

// Je récupère les lignes venant du front pour construire des lignes de devis
function buildDevisLines(linesInput: CreateDevisLineInput[]): DevisLine[] {
    return linesInput.map((lineInput) => {
        const basePrice = getBasePriceByProductType(lineInput.productType);
        const lineTotalPrice = basePrice * lineInput.quantity;

        return {
            product: {
                type: lineInput.productType,
                basePrice,
                color: lineInput.color
            },
            quantity: lineInput.quantity,
            lineTotalPrice,
        };
    });
}

// Je calcule le prix total du devis
function calculateTotalDevisPrice(lines: DevisLine[]): number {
    return lines.reduce((total, line) => {
        return total + line.lineTotalPrice;
    }, 0);
};

function getBasePriceByProductType(productType: ProductType): number {
    switch (productType) {
        case "tshirt":
            return PRODUCT_BASE_PRICES.tshirt;
        case "sweatshirt":
            return PRODUCT_BASE_PRICES.sweatshirt;
        default:
            throw new Error(`Le type de produit est inconnu: ${productType}`);
    }
}

const PRODUCT_BASE_PRICES = {
    tshirt: 10,
    sweatshirt: 20,
};

// Futur methode à faire:
// export async function getDevisById(id: number): Promise<Devis> 