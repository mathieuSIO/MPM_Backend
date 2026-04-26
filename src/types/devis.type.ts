import type { DevisLine } from "./devis-line.type.js";

export type Devis = {
    lines: DevisLine[];
    totalPrice: number;
}