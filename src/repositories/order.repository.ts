import type { PoolClient } from "pg";
import { db } from "../db/connection.js";
import type { CreateOrderRepositoryInput, CreateOrderRepositoryOutput, CreateOrderWithItemsInput, OrderDetailsRow, OrderItemDetailsRow, OrderMetaPurchaseItemRow, OrderMetaPurchaseRow, OrderSummaryRow, ProductReferenceWeightRow, ShopProductWeightRow, UpdateOrderShippingInput } from "../types/order.repository.types.js";
import type { RelaySelectionContextRow, SelectedRelayPointRow } from "../types/relay-point.types.js";
import type { MondialRelayPoint } from "../integrations/mondial-relay/mondial-relay.types.js";
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
            await this.insertOrderShipment(client, order.id, input.shipping);

            // 2. Insert items
            for (const item of input.items) {
                await client.query(
                    `INSERT INTO order_items (
                        order_id,
                        item_type,
                        product_id,
                        shop_product_id,
                        shop_product_variant_id,
                        product_name,
                        quantity,
                        unit_price_cents,
                        total_price_cents,
                        customization,
                        final_preview_url
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,  $10, $11)`,
                    [
                        order.id,
                        item.itemType,
                        item.productId ?? null,
                        item.shopProductId ?? null,
                        item.shopProductVariantId ?? null,
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
                    professional_logo_review_price_cents,
                    promo_code_id,
                    promo_code,
                    discount_cents
                FROM orders 
                WHERE user_id = $1
                AND status IN ('paid', 'processing', 'shipped', 'completed', 'cancelled')
                ORDER BY created_at DESC
                `,
                [userId]
            );
            return result.rows;
        } catch (err) {
            console.log("Error fetching orders by user ID:", err);
            throw err;
        } finally {
            client.release();
        }
    }

    async findOrderDetailsById(orderId: number, userId: number): Promise<OrderDetailsRow | null> {
        const orderResult = await db.query<Omit<OrderDetailsRow, "items">>(
            `
            SELECT
                o.id,
                o.status,
                o.total_price_cents,
                o.customer_first_name,
                o.customer_last_name,
                o.customer_email,
                o.customer_phone,
                o.shipping_address_line1,
                o.shipping_address_line2,
                o.shipping_postal_code,
                o.shipping_city,
                o.shipping_country,
                o.created_at,
                o.production_option,
                o.production_label,
                o.production_percentage,
                o.production_price_cents,
                o.professional_logo_review_enabled,
                o.professional_logo_review_price_cents,
                o.promo_code_id,
                o.promo_code,
                o.discount_cents,
                os.shipping_method,
                os.shipping_label,
                os.shipping_price_cents,
                os.total_weight_grams,
                os.carrier,
                os.tracking_number,
                os.tracking_url,
                os.status AS shipping_status
            FROM orders o
            LEFT JOIN order_shipments os
            ON os.order_id = o.id
            WHERE o.id = $1
            AND o.user_id = $2
            AND o.status IN ('paid', 'processing', 'shipped', 'completed', 'cancelled')
            `,
            [orderId, userId]
        );

        const order = orderResult.rows[0];

        if (!order) return null;

        const itemsResult = await db.query<OrderItemDetailsRow>(
            `
            SELECT
                oi.id,
                oi.item_type,
                oi.product_id,
                oi.shop_product_id,
                oi.shop_product_variant_id,
                oi.product_name,
                oi.quantity,
                oi.unit_price_cents,
                oi.total_price_cents,
                oi.customization,
                oi.final_preview_url,
                spv.size_label AS variant_size_label,
                spv.color_name AS variant_color_name,
                spv.color_hex AS variant_color_hex,
                spv.sku AS variant_sku,
                spv.image_url AS variant_image_url
            FROM order_items oi
            LEFT JOIN shop_product_variants spv
                ON spv.id = oi.shop_product_variant_id
            WHERE oi.order_id = $1
            ORDER BY oi.id ASC
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
            professional_logo_review_price_cents,
            promo_code_id,
            promo_code,
            discount_cents
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
            o.id,
            o.status,
            o.total_price_cents,
            o.customer_first_name,
            o.customer_last_name,
            o.customer_email,
            o.customer_phone,
            o.shipping_address_line1,
            o.shipping_address_line2,
            o.shipping_postal_code,
            o.shipping_city,
            o.shipping_country,
            o.created_at,
            o.production_option,
            o.production_label,
            o.production_percentage,
            o.production_price_cents,
            o.professional_logo_review_enabled,
            o.professional_logo_review_price_cents,
            o.promo_code_id,
            o.promo_code,
            o.discount_cents,
            os.shipping_method,
            os.shipping_label,
            os.shipping_price_cents,
            os.total_weight_grams,
            os.carrier,
            os.tracking_number,
            os.tracking_url,
            os.status AS shipping_status
        FROM orders o
        LEFT JOIN order_shipments os
        ON os.order_id = o.id
        WHERE o.id = $1
        `,
            [orderId]
        );

        const order = orderResult.rows[0];

        if (!order) return null;

        const itemsResult = await db.query<OrderItemDetailsRow>(
            `
        SELECT
            oi.id,
            oi.item_type,
            oi.product_id,
            oi.shop_product_id,
            oi.shop_product_variant_id,
            oi.product_name,
            oi.quantity,
            oi.unit_price_cents,
            oi.total_price_cents,
            oi.customization,
            oi.final_preview_url,
            spv.size_label AS variant_size_label,
            spv.color_name AS variant_color_name,
            spv.color_hex AS variant_color_hex,
            spv.sku AS variant_sku,
            spv.image_url AS variant_image_url
        FROM order_items oi
        LEFT JOIN shop_product_variants spv
            ON spv.id = oi.shop_product_variant_id
        WHERE oi.order_id = $1
        ORDER BY oi.id ASC
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
        SET
            status = $1,
            updated_at = NOW()
        WHERE id = $2
        `,
            [status, orderId]
        );
    }

    async findOrderById(orderId: number): Promise<OrderSummaryRow | null> {
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
            professional_logo_review_price_cents,
            promo_code_id,
            promo_code,
            discount_cents
        FROM orders
        WHERE id = $1
        `,
            [orderId]
        );

        return result.rows[0] ?? null;
    }

    async findOrderMetaPurchaseById(orderId: number): Promise<OrderMetaPurchaseRow | null> {
        const orderResult = await db.query<Omit<OrderMetaPurchaseRow, "items">>(
            `
        SELECT
            id,
            status,
            total_price_cents,
            customer_first_name,
            customer_last_name,
            customer_email,
            customer_phone,
            meta_purchase_event_sent_at
        FROM orders
        WHERE id = $1
        `,
            [orderId]
        );

        const order = orderResult.rows[0];

        if (!order) {
            return null;
        }

        const itemsResult = await db.query<OrderMetaPurchaseItemRow>(
            `
        SELECT
            product_id,
            shop_product_id,
            shop_product_variant_id,
            product_name,
            quantity
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

    async markMetaPurchaseEventSent(orderId: number): Promise<void> {
        await db.query(
            `
        UPDATE orders
        SET meta_purchase_event_sent_at = NOW()
        WHERE id = $1
        AND meta_purchase_event_sent_at IS NULL
        `,
            [orderId]
        );
    }

    async findProductReferenceWeightsByProductIds(
        productIds: number[]
    ): Promise<ProductReferenceWeightRow[]> {
        const result = await db.query<ProductReferenceWeightRow>(
            `
        SELECT DISTINCT ON (product_id)
            product_id,
            weight_grams
        FROM product_references
        WHERE product_id = ANY($1::int[])
          AND is_active = true
        ORDER BY product_id, id ASC
        `,
            [productIds]
        );

        return result.rows;
    }

    async updateOrderShipping(input: UpdateOrderShippingInput): Promise<void> {
        await db.query(
            `
        UPDATE order_shipments
        SET
            tracking_number = COALESCE($1, tracking_number),
            tracking_url = COALESCE($2, tracking_url),
            status = COALESCE($3, status),
            updated_at = now()
        WHERE order_id = $4
        `,
            [
                input.trackingNumber ?? null,
                input.trackingUrl ?? null,
                input.status ?? null,
                input.orderId,
            ]
        );
    }

    async findShopProductWeightsByIds(
        shopProductIds: number[]
    ): Promise<ShopProductWeightRow[]> {
        if (shopProductIds.length === 0) {
            return [];
        }

        const result = await db.query<ShopProductWeightRow>(
            `
        SELECT
            id,
            weight_grams
        FROM shop_products
        WHERE id = ANY($1::int[])
        `,
            [shopProductIds]
        );

        return result.rows;
    }

    async findRelaySelectionContextByCheckoutSessionId(
        checkoutSessionId: string
    ): Promise<RelaySelectionContextRow | null> {
        const result = await db.query<RelaySelectionContextRow>(
            `
        SELECT
            o.id AS order_id,
            o.status AS order_status,

            p.status AS payment_status,

            os.shipping_method,
            os.status AS shipment_status,
            os.relay_selection_status,
            os.relay_point_id,
            os.relay_point_name,

            os.relay_point_address_line1,
            os.relay_point_address_line2,
            os.relay_point_postal_code,
            os.relay_point_city,
            os.relay_point_country,
            os.relay_point_latitude,
            os.relay_point_longitude

        FROM payments p

        INNER JOIN orders o
            ON o.id = p.order_id

        INNER JOIN order_shipments os
            ON os.order_id = o.id

        WHERE p.provider_checkout_session_id = $1

        LIMIT 1
        `,
            [checkoutSessionId]
        );

        return result.rows[0] ?? null;
    }

    async selectRelayPoint(orderId: number, input: MondialRelayPoint): Promise<SelectedRelayPointRow | null> {
        const legacyAddress = [
            input.addressLine1,
            input.addressLine2,
            `${input.postalCode} ${input.city}`,
            input.country,
        ]
            .filter(
                (value): value is string =>
                    typeof value === "string" &&
                    value.trim().length > 0
            )
            .join(", ");

        const result = await db.query<SelectedRelayPointRow>(
            `
        UPDATE order_shipments
        SET
            relay_selection_status = 'selected',

            relay_point_id = $1,
            relay_point_name = $2,

            relay_point_address = $3,
            relay_point_address_line1 = $4,
            relay_point_address_line2 = $5,
            relay_point_postal_code = $6,
            relay_point_city = $7,
            relay_point_country = $8,

            relay_point_latitude = $9,
            relay_point_longitude = $10,

            relay_point_selected_at = now(),
            updated_at = now()

        WHERE order_id = $11
          AND shipping_method = 'mondial_relay'
          AND relay_selection_status = 'pending'
          AND status NOT IN (
              'label_created',
              'shipped',
              'delivered'
          )

        RETURNING
            order_id,
            relay_selection_status,
            relay_point_id,
            relay_point_name,
            relay_point_address_line1,
            relay_point_address_line2,
            relay_point_postal_code,
            relay_point_city,
            relay_point_country,
            relay_point_latitude,
            relay_point_longitude,
            relay_point_selected_at
        `,
            [
                input.id,
                input.name,
                legacyAddress,
                input.addressLine1,
                input.addressLine2 ?? null,
                input.postalCode,
                input.city,
                input.country.toUpperCase(),
                input.latitude ?? null,
                input.longitude ?? null,
                orderId,
            ]
        );

        return result.rows[0] ?? null;
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
                    professional_logo_review_price_cents,
                    promo_code_id,
                    promo_code,
                    discount_cents
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
                input.promoCodeId ?? null,
                input.promoCode ?? null,
                input.discountCents,
            ]
        );

        const order = orderResult.rows[0];
        if (!order) throw new Error("Order creation failed");
        return order;
    }

    private async insertOrderShipment(client: PoolClient, orderId: number, shipping: CreateOrderWithItemsInput["shipping"]): Promise<void> {
        const relaySelectionStatus =
            shipping.method === "mondial_relay"
                ? "pending"
                : "not_required";

        await client.query(
            `
        INSERT INTO order_shipments (
            order_id,
            shipping_method,
            shipping_label,
            shipping_price_cents,
            total_weight_grams,
            carrier,
            status,
            relay_selection_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
        `,
            [
                orderId,
                shipping.method,
                shipping.label,
                shipping.priceCents,
                shipping.totalWeightGrams,
                shipping.method,
                relaySelectionStatus,
            ]
        );
    }
    //#endregion


}

