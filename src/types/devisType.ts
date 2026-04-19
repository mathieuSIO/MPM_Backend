import type { DevisLine } from "./devisLineType.js";

export type Devis = {
    totalPrice: number;
    lines: DevisLine[];
}