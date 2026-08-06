import type {
    Request,
    Response,
} from "express";

import { RelayPointService } from "../services/relay-point.service.js";

export class RelayPointController {
    constructor(
        private readonly relayPointService =
            new RelayPointService()
    ) { }

    selectRelayPoint = async (
        req: Request,
        res: Response
    ): Promise<void> => {
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
}