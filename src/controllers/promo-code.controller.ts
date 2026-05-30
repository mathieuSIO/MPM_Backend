import type { Request, Response } from "express";

import { PromoCodeService } from "../services/promo-code.service.js";

export class PromoCodeController {
    constructor(
        private readonly promoCodeService = new PromoCodeService()
    ) { }

    validatePromoCode = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const result = await this.promoCodeService.validatePromoCode(
            req.body
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    getAdminPromoCodes = async (
        _req: Request,
        res: Response
    ): Promise<void> => {
        const result =
            await this.promoCodeService.getAdminPromoCodes();

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    createAdminPromoCode = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const result =
            await this.promoCodeService.createAdminPromoCode(
                req.body
            );

        res.status(201).json({
            success: true,
            data: result,
        });
    };
}