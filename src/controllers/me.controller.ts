import type { Request, Response } from "express";

import { MeService } from "../services/me.service.js";

export class MeController {
    constructor(private readonly meService = new MeService()) {}

    getMe = async (req: Request, res: Response): Promise<void> => {
        const result = await this.meService.getMe(req.user!.userId);

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    updateMe = async (req: Request, res: Response): Promise<void> => {
        const result = await this.meService.updateMe(
            req.user!.userId,
            req.body
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    changePassword = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        await this.meService.changePassword(req.user!.userId, req.body);

        res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    };
}