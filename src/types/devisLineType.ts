import type { Product } from "./productType.js"

export type DevisLine = {
    product: Product;
    quantity: number;
    lineTotal: number;
}