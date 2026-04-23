import type { Color, Product } from "./productType.js"

export type DevisLine = {
    product: Product;
    quantity: number;
    lineTotalPrice: number;
}