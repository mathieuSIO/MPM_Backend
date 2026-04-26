import type { Request, Response } from "express";
import { createDevis } from "../services/devis.service.js";
import type { CreateDevisInput } from "../types/create-devis-input.type.js";

export async function createDevisController(req: Request, res: Response): Promise<void> {
    try {
        const devisInput = req.body as CreateDevisInput;
        const devis = await createDevis(devisInput);

        res.status(201).json({
            success: true,
            message: "Devis créé avec succès",
            data: devis,
        });
    } catch (error) {
        console.error("Error in createDevisController:", error);

        res.status(500).json({
            success: false,
            message: "Erreur lors de la création du devis, le devis n'a pas été crée",
        });
    }
}