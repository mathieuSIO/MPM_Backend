import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { OrderRepository } from "../repositories/order.repository.js";
import { MondialRelayClient } from "../integrations/mondial-relay/mondial-relay.client.js";

import type { RelaySelectionDetails, SelectRelayPointInput, SelectedRelayPointRow } from "../types/relay-point.types.js";

export class RelayPointService {
    constructor(
        private readonly orderRepository = new OrderRepository(),
        private readonly mondialRelayClient = new MondialRelayClient()
    ) { }

    async selectRelayPoint(
        input: SelectRelayPointInput
    ): Promise<SelectedRelayPointRow> {
        const context =
            await this.orderRepository
                .findRelaySelectionContextByCheckoutSessionId(
                    input.checkoutSessionId
                );

        if (!context) {
            throw new NotFoundError(
                "Order not found for checkout session"
            );
        }

        if (
            context.payment_status !== "paid" ||
            context.order_status !== "paid"
        ) {
            throw new BadRequestError(
                "The order must be paid before selecting a relay point"
            );
        }

        if (
            context.shipping_method !== "mondial_relay"
        ) {
            throw new BadRequestError(
                "Relay point selection is not required for this order"
            );
        }

        if (
            context.relay_selection_status === "selected"
        ) {
            throw new BadRequestError(
                "A relay point has already been selected"
            );
        }

        if (
            context.relay_selection_status !== "pending"
        ) {
            throw new BadRequestError(
                "Relay point selection is not available"
            );
        }

        if (
            context.shipment_status === "label_created" ||
            context.shipment_status === "shipped" ||
            context.shipment_status === "delivered"
        ) {
            throw new BadRequestError(
                "The relay point can no longer be changed"
            );
        }

        const officialRelayPoint = await this.mondialRelayClient.validateRelayPoint({
            relayPointId: input.relayPoint.id,
            country: input.relayPoint.country,
        });

        const selectedRelayPoint = await this.orderRepository.selectRelayPoint(
            context.order_id,
            officialRelayPoint
        );

        if (!selectedRelayPoint) {
            throw new BadRequestError(
                "The relay point could not be saved"
            );
        }

        return selectedRelayPoint;
    }

    async getRelaySelection(
        checkoutSessionId: string
    ): Promise<RelaySelectionDetails> {
        const context =
            await this.orderRepository
                .findRelaySelectionContextByCheckoutSessionId(
                    checkoutSessionId
                );

        if (!context) {
            throw new NotFoundError(
                "Order not found for checkout session"
            );
        }

        const relayPoint =
            context.relay_selection_status === "selected" &&
                context.relay_point_id &&
                context.relay_point_name
                ? {
                    id: context.relay_point_id,
                    name: context.relay_point_name,
                    addressLine1:
                        context.relay_point_address_line1 ?? "",
                    addressLine2:
                        context.relay_point_address_line2,
                    postalCode:
                        context.relay_point_postal_code ?? "",
                    city:
                        context.relay_point_city ?? "",
                    country:
                        context.relay_point_country ?? "",
                    latitude:
                        context.relay_point_latitude !== null
                            ? Number(context.relay_point_latitude)
                            : null,
                    longitude:
                        context.relay_point_longitude !== null
                            ? Number(context.relay_point_longitude)
                            : null,
                }
                : null;

        return {
            orderId: context.order_id,
            orderStatus: context.order_status,
            paymentStatus: context.payment_status,
            shippingMethod: context.shipping_method,
            relaySelectionStatus:
                context.relay_selection_status,
            relayPoint,
        };
    }
}