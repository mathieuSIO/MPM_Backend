import type { Request, Response } from "express";

import { MeService } from "../services/me.service.js";
import { orderRelayPointParamsSchema, selectRelayPointForUserSchema } from "../schemas/relay-point.schema.js";
import { RelayPointService } from "../services/relay-point.service.js";

export class MeController {
    constructor(private readonly meService = new MeService(), private readonly relayPointService = new RelayPointService()) { }

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

    changePassword = async (req: Request, res: Response): Promise<void> => {
        await this.meService.changePassword(req.user!.userId, req.body);

        res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    };

    getRelaySelectionForOrder = async (req: Request, res: Response): Promise<void> => {
        const params =
            orderRelayPointParamsSchema.parse(
                req.params
            );

        const userId = req.user!.userId;

        const relaySelection =
            await this.relayPointService
                .getRelaySelectionForUser(
                    userId,
                    params.orderId
                );

        res.status(200).json({
            success: true,
            data: relaySelection,
        });
    };

    selectRelayPointForOrder = async (req: Request, res: Response): Promise<void> => {
        const params =
            orderRelayPointParamsSchema.parse(
                req.params
            );

        const input =
            selectRelayPointForUserSchema.parse(
                req.body
            );

        const userId = req.user!.userId;

        const selectedRelayPoint =
            await this.relayPointService
                .selectRelayPointForUser(
                    userId,
                    params.orderId,
                    input.relayPoint
                );

        res.status(200).json({
            success: true,
            data: selectedRelayPoint,
        });
    };

}