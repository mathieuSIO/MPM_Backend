import type { Color, Product } from "./product.type.js"

export type DevisLine = {
    product: Product;
    quantity: number;
    lineTotalPrice: number;
}