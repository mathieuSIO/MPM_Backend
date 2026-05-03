import type { PoolClient } from "pg";
import { db } from "../db/connection.js";
import type { CreateOrderRepositoryInput, CreateOrderRepositoryOutput, CreateOrderWithItemsInput, OrderSummaryRow } from "../types/order.repository.types.js";

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

    async getOrdersByUserId(userId: number): Promise<OrderSummaryRow[]> {
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
                    created_at
                FROM orders 
                WHERE user_id = $1
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
                    shipping_country
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            ]
        );

        const order = orderResult.rows[0];
        if (!order) throw new Error("Order creation failed");
        return order;
    }
    //#endregion


}

