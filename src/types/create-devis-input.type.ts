import type { Color, ProductType } from "./product.type.js";

export type CreateDevisLineInput = {
    productType: ProductType;
    color: Color;
    quantity: number;
}

export type CreateDevisInput = {
    lines: CreateDevisLineInput[];
}