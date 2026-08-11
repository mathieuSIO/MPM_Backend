import type { Request, Response, } from "express";

import { RelayPointService } from "../services/relay-point.service.js";
import { BadRequestError } from "../errors/http-errors.js";

export class RelayPointController {
    constructor(
        private readonly relayPointService =
            new RelayPointService()
    ) { }

    selectRelayPoint = async (req: Request, res: Response): Promise<void> => {
        const relayPoint =
            await this.relayPointService.selectRelayPoint(
                req.body
            );

        res.status(200).json({
            success: true,
            message:
                "Relay point selected successfully",
            data: relayPoint,
        });
    };

    getRelaySelection = async (req: Request, res: Response): Promise<void> => {
        const checkoutSessionId =
            req.query.checkoutSessionId;

        if (
            typeof checkoutSessionId !== "string" ||
            checkoutSessionId.trim().length === 0
        ) {
            throw new BadRequestError(
                "checkoutSessionId query parameter is required"
            );
        }

        const relaySelection =
            await this.relayPointService.getRelaySelection(
                checkoutSessionId
            );

        res.status(200).json({
            success: true,
            data: relaySelection,
        });
    };
}