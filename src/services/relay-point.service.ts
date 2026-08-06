import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import { OrderRepository } from "../repositories/order.repository.js";
import { MondialRelayService } from "./mondial-relay.service.js";

import type { SelectRelayPointInput, SelectedRelayPointRow } from "../types/relay-point.types.js";

export class RelayPointService {
    constructor(
        private readonly orderRepository = new OrderRepository(),
        private readonly mondialRelayService = new MondialRelayService()
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

        const officialRelayPoint = await this.mondialRelayService.validateRelayPoint({
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
}