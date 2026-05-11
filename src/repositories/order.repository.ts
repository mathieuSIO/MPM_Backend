import type { PoolClient } from "pg";
import { db } from "../db/connection.js";
import type { CreateOrderRepositoryInput, CreateOrderRepositoryOutput, CreateOrderWithItemsInput, OrderDetailsRow, OrderItemDetailsRow, OrderSummaryRow } from "../types/order.repository.types.js";
import type { OrderStatus } from "../types/order.types.js";

export class OrderRepository {

    //Can be used to create order without items
    async createOrder(input: CreateOrderRepositoryInput): Promise<CreateOrderRepositoryOutput> {
        const client = await db.connect();
        try {
            await client.query("BEGIN");
            const order = await this.insertOrder(client, input);
            await client.query("COMMIT");

            return { id: order.id };
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async createOrderWithItems(input: CreateOrderWithItemsInput): Promise<CreateOrderRepositoryOutput> {
        const client = await db.connect();

        try {
            await client.query("BEGIN");

            // 1. Create order
            const order = await this.insertOrder(client, input.order);

            // 2. Insert items
            for (const item of input.items) {
                await client.query(
                    `INSERT INTO order_items (
                        order_id,
                        product_id,
                        product_name,
                        quantity,
                        unit_price_cents,
                        total_price_cents,
                        customization,
                        final_preview_url
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        order.id,
                        item.productId,
                        item.productName,
                        item.quantity,
                        item.unitPriceCents,
                        item.quantity * item.unitPriceCents,
                        item.customization ? JSON.stringify(item.customization) : null,
                        item.finalPreviewUrl ?? null,
                    ]
                );
            }

            await client.query("COMMIT");

            return { id: order.id };

        } catch (err) {
            console.log("Error in createOrderWithItems transaction:", err);
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async findOrdersByUserId(userId: number): Promise<OrderSummaryRow[]> {
        const client = await db.connect();
        try {
            const result = await client.query<OrderSummaryRow>(
                `SELECT
                    id,
                    status,
                    total_price_cents,
                    customer_first_name,
                    customer_last_name,
                    customer_email,
                    created_at,
                    production_option,
                    production_label,
                    production_percentage,
                    production_price_cents,
                    professional_logo_review_enabled,
                    professional_logo_review_price_cents
                FROM orders 
                WHERE user_id = $1
                ORDER BY created_at DESC
                `,
                [userId]
            );
            return result.rows;
        } catch (err) {
            console.log("Error fetching orders by user ID:", err);
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    async findOrderDetailsById(orderId: number, userId: number): Promise<OrderDetailsRow | null> {
        const orderResult = await db.query<Omit<OrderDetailsRow, "items">>(
            `
            SELECT
                id,
                status,
                total_price_cents,
                customer_first_name,
                customer_last_name,
                customer_email,
                customer_phone,
                shipping_address_line1,
                shipping_address_line2,
                shipping_postal_code,
                shipping_city,
                shipping_country,
                created_at,
                production_option,
                production_label,
                production_percentage,
                production_price_cents,
                professional_logo_review_enabled,
                professional_logo_review_price_cents
            FROM orders
            WHERE id = $1 AND user_id = $2
            `,
            [orderId, userId]
        );

        const order = orderResult.rows[0];

        if (!order) return null;

        const itemsResult = await db.query<OrderItemDetailsRow>(
            `
            SELECT
                id,
                product_id,
                product_name,
                quantity,
                unit_price_cents,
                total_price_cents,
                customization,
                final_preview_url
            FROM order_items
            WHERE order_id = $1
            ORDER BY id ASC
            `,
            [orderId]
        );

        return {
            ...order,
            items: itemsResult.rows,
        };
    }

    async findAllOrders(): Promise<OrderSummaryRow[]> {
        const result = await db.query<OrderSummaryRow>(
            `
        SELECT
            id,
            status,
            total_price_cents,
            customer_first_name,
            customer_last_name,
            customer_email,
            created_at,
            production_option,
            production_label,
            production_percentage,
            production_price_cents,
            professional_logo_review_enabled,
            professional_logo_review_price_cents
        FROM orders
        ORDER BY created_at DESC
        `
        );

        return result.rows;
    }

    async findAdminOrderDetailsById(orderId: number): Promise<OrderDetailsRow | null> {
        const orderResult = await db.query<Omit<OrderDetailsRow, "items">>(
            `
        SELECT
            id,
            status,
            total_price_cents,
            customer_first_name,
            customer_last_name,
            customer_email,
            customer_phone,
            shipping_address_line1,
            shipping_address_line2,
            shipping_postal_code,
            shipping_city,
            shipping_country,
            created_at,
            production_option,
            production_label,
            production_percentage,
            production_price_cents,
            professional_logo_review_enabled,
            professional_logo_review_price_cents
        FROM orders
        WHERE id = $1
        `,
            [orderId]
        );

        const order = orderResult.rows[0];

        if (!order) return null;

        const itemsResult = await db.query<OrderItemDetailsRow>(
            `
        SELECT
            id,
            product_id,
            product_name,
            quantity,
            unit_price_cents,
            total_price_cents,
            customization,
            final_preview_url
        FROM order_items
        WHERE order_id = $1
        ORDER BY id ASC
        `,
            [orderId]
        );

        return {
            ...order,
            items: itemsResult.rows,
        };
    }

    async updateOrderStatus(orderId: number, status: OrderStatus): Promise<void> {
        await db.query(
            `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        `,
            [status, orderId]
        );
    }

    //#region Private methods for request handling
    private async insertOrder(client: PoolClient, input: CreateOrderRepositoryInput): Promise<{ id: number }> {
        const orderResult = await client.query<{ id: number }>(
            `INSERT INTO orders (
                    user_id,
                    total_price_cents,
                    customer_email,
                    customer_first_name,
                    customer_last_name,
                    customer_phone,
                    shipping_address_line1,
                    shipping_address_line2,
                    shipping_postal_code,
                    shipping_city,
                    shipping_country,
                    production_option,
                    production_label,
                    production_percentage,
                    production_price_cents,
                    professional_logo_review_enabled,
                    professional_logo_review_price_cents
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING id`,
            [
                input.userId ?? null,
                input.totalPriceCents,
                input.customerEmail,
                input.customerFirstName ?? null,
                input.customerLastName ?? null,
                input.customerPhone ?? null,
                input.shippingAddressLine1 ?? null,
                input.shippingAddressLine2 ?? null,
                input.shippingPostalCode ?? null,
                input.shippingCity ?? null,
                input.shippingCountry ?? null,
                input.productionOption,
                input.productionLabel,
                input.productionPercentage,
                input.productionPriceCents,
                input.professionalLogoReviewEnabled,
                input.professionalLogoReviewPriceCents,
            ]
        );

        const order = orderResult.rows[0];
        if (!order) throw new Error("Order creation failed");
        return order;
    }
    //#endregion


}

