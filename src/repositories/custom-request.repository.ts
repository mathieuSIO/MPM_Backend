import { db } from "../db/connection.js";
import { InternalServerError } from "../errors/http-errors.js";
import type {
    CreateCustomRequestInput,
    CustomRequestRow,
    CustomRequestStatus,
} from "../types/custom-request.types.js";

export class CustomRequestRepository {
    async create(input: CreateCustomRequestInput): Promise<CustomRequestRow> {
        const result = await db.query<CustomRequestRow>(
            `
            INSERT INTO custom_requests (
                user_id,
                customer_email,
                customer_first_name,
                customer_last_name,
                customer_phone,
                message
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                user_id,
                customer_email,
                customer_first_name,
                customer_last_name,
                customer_phone,
                message,
                status,
                created_at,
                updated_at
            `,
            [
                input.userId ?? null,
                input.customerEmail,
                input.customerFirstName ?? null,
                input.customerLastName ?? null,
                input.customerPhone ?? null,
                input.message,
            ]
        );

        const customRequest = result.rows[0];

        if (!customRequest) {
            throw new InternalServerError("Custom request creation failed");
        }

        return customRequest;
    }

    async findAll(): Promise<CustomRequestRow[]> {
        const result = await db.query<CustomRequestRow>(
            `
            SELECT
                id,
                user_id,
                customer_email,
                customer_first_name,
                customer_last_name,
                customer_phone,
                message,
                status,
                created_at,
                updated_at
            FROM custom_requests
            ORDER BY created_at DESC
            `
        );

        return result.rows;
    }

    async findById(requestId: number): Promise<CustomRequestRow | null> {
        const result = await db.query<CustomRequestRow>(
            `
            SELECT
                id,
                user_id,
                customer_email,
                customer_first_name,
                customer_last_name,
                customer_phone,
                message,
                status,
                created_at,
                updated_at
            FROM custom_requests
            WHERE id = $1
            LIMIT 1
            `,
            [requestId]
        );

        return result.rows[0] ?? null;
    }

    async updateStatus(
        requestId: number,
        status: CustomRequestStatus
    ): Promise<CustomRequestRow | null> {
        const result = await db.query<CustomRequestRow>(
            `
            UPDATE custom_requests
            SET
                status = $1,
                updated_at = now()
            WHERE id = $2
            RETURNING
                id,
                user_id,
                customer_email,
                customer_first_name,
                customer_last_name,
                customer_phone,
                message,
                status,
                created_at,
                updated_at
            `,
            [status, requestId]
        );

        return result.rows[0] ?? null;
    }
}