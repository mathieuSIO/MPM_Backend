import type { Request, Response } from "express";

import { CustomRequestService } from "../services/custom-request.service.js";
import type { CustomRequestStatus } from "../types/custom-request.types.js";

export class CustomRequestController {
    constructor(
        private readonly customRequestService = new CustomRequestService()
    ) { }

    createCustomRequest = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const result = await this.customRequestService.createCustomRequest({
            ...req.body,
            userId: req.user?.userId ?? null,
        });

        res.status(201).json({
            success: true,
            data: result,
        });
    };

    getAdminCustomRequests = async (
        _req: Request,
        res: Response
    ): Promise<void> => {
        const result =
            await this.customRequestService.getAdminCustomRequests();

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    getAdminCustomRequestDetails = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const requestId = Number(req.params.requestId);

        const result =
            await this.customRequestService.getAdminCustomRequestDetails(
                requestId
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    };

    updateAdminCustomRequestStatus = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const requestId = Number(req.params.requestId);
        const status = req.body.status as CustomRequestStatus;

        const result =
            await this.customRequestService.updateAdminCustomRequestStatus(
                requestId,
                status
            );

        res.status(200).json({
            success: true,
            data: result,
        });
    };
}