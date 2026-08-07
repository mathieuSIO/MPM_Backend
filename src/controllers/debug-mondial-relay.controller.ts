import type { Request, Response } from "express";

import { BadRequestError } from "../errors/http-errors.js";

import { MondialRelayClient } from "../integrations/mondial-relay/mondial-relay.client.js";

export class DebugMondialRelayController {
    constructor(
        private readonly mondialRelayClient =
            new MondialRelayClient()
    ) {}

    testRelayPoint = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const relayPointId = req.query.relayPointId;
        const country = req.query.country;

        if (
            typeof relayPointId !== "string" ||
            relayPointId.trim().length === 0
        ) {
            throw new BadRequestError(
                "relayPointId query parameter is required"
            );
        }

        if (
            typeof country !== "string" ||
            country.trim().length === 0
        ) {
            throw new BadRequestError(
                "country query parameter is required"
            );
        }

        const relayPoint =
            await this.mondialRelayClient.validateRelayPoint({
                relayPointId,
                country,
            });

        res.status(200).json({
            success: true,
            data: relayPoint,
        });
    };
}