import type { DevisLine } from "./devisLineType.js";

export type Devis = {
    lines: DevisLine[];
    totalPrice: number;
}