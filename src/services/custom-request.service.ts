import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { CustomRequestRepository } from "../repositories/custom-request.repository.js";
import { EmailService } from "./email/email.service.js";
import type {
    CreateCustomRequestInput,
    CustomRequestRow,
    CustomRequestStatus,
    PublicCustomRequest,
} from "../types/custom-request.types.js";

export class CustomRequestService {
    constructor(
        private readonly customRequestRepository = new CustomRequestRepository(),
        private readonly emailService = new EmailService()
    ) { }

    async createCustomRequest(
        input: CreateCustomRequestInput
    ): Promise<PublicCustomRequest> {
        const customRequest = await this.customRequestRepository.create(input);

        try {
            await this.emailService.sendCustomRequestAdminEmail({
                customerEmail: customRequest.customer_email,
                customerFirstName: customRequest.customer_first_name,
                customerLastName: customRequest.customer_last_name,
                customerPhone: customRequest.customer_phone,
                message: customRequest.message,
            });
        } catch (error) {
            console.error("Failed to send custom request admin email:", error);
        }

        return this.toPublicCustomRequest(customRequest);
    }

    async getAdminCustomRequests(): Promise<PublicCustomRequest[]> {
        const customRequests = await this.customRequestRepository.findAll();

        return customRequests.map((customRequest) =>
            this.toPublicCustomRequest(customRequest)
        );
    }

    async getAdminCustomRequestDetails(
        requestId: number
    ): Promise<PublicCustomRequest> {
        if (!Number.isInteger(requestId) || requestId <= 0) {
            throw new BadRequestError("Invalid custom request id");
        }

        const customRequest = await this.customRequestRepository.findById(requestId);

        if (!customRequest) {
            throw new NotFoundError("Custom request not found");
        }

        return this.toPublicCustomRequest(customRequest);
    }

    async updateAdminCustomRequestStatus(
        requestId: number,
        status: CustomRequestStatus
    ): Promise<PublicCustomRequest> {
        if (!Number.isInteger(requestId) || requestId <= 0) {
            throw new BadRequestError("Invalid custom request id");
        }

        const customRequest = await this.customRequestRepository.updateStatus(
            requestId,
            status
        );

        if (!customRequest) {
            throw new NotFoundError("Custom request not found");
        }

        return this.toPublicCustomRequest(customRequest);
    }

    private toPublicCustomRequest(
        customRequest: CustomRequestRow
    ): PublicCustomRequest {
        return {
            id: customRequest.id,
            userId: customRequest.user_id,
            customerEmail: customRequest.customer_email,
            customerFirstName: customRequest.customer_first_name,
            customerLastName: customRequest.customer_last_name,
            customerPhone: customRequest.customer_phone,
            message: customRequest.message,
            status: customRequest.status,
            createdAt: customRequest.created_at,
            updatedAt: customRequest.updated_at,
        };
    }
}