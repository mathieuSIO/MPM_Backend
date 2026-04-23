import type { Color, ProductType } from "./productType.js";

export type CreateDevisLineInput = {
    productType: ProductType;
    color: Color;
    quantity: number;
}

export type CreateDevisInput = {
    lines: CreateDevisLineInput[];
}