import { beforeEach, describe, expect, it, vi } from "vitest";

import { RelayPointService } from "./relay-point.service.js";

import type { OrderRepository } from "../repositories/order.repository.js";
import type { MondialRelayClient } from "../integrations/mondial-relay/mondial-relay.client.js";

import type {
    RelaySelectionContextRow,
    SelectedRelayPointRow,
    SelectRelayPointInput,
} from "../types/relay-point.types.js";

import type { MondialRelayPoint } from "../integrations/mondial-relay/mondial-relay.types.js";

describe("RelayPointService", () => {
    let orderRepository: {
        findRelaySelectionContextByCheckoutSessionId: ReturnType<typeof vi.fn>;
        selectRelayPoint: ReturnType<typeof vi.fn>;
        findRelaySelectionContextByUserAndOrderId: ReturnType<typeof vi.fn>;
    };

    let mondialRelayClient: {
        validateRelayPoint: ReturnType<typeof vi.fn>;
    };

    let service: RelayPointService;

    const relaySelectionContext: RelaySelectionContextRow = {
        order_id: 42,
        order_status: "paid",
        payment_status: "paid",

        shipping_method: "mondial_relay",
        shipment_status: "pending",
        relay_selection_status: "pending",

        relay_point_id: null,
        relay_point_name: null,
        relay_point_address_line1: null,
        relay_point_address_line2: null,
        relay_point_postal_code: null,
        relay_point_city: null,
        relay_point_country: null,
        relay_point_latitude: null,
        relay_point_longitude: null
    };

    const officialRelayPoint: MondialRelayPoint = {
        id: "033594",
        name: "LOCKER 24/7 LE FOURNIL DE MATEF",
        addressLine1: "171 ROUTE DE LAUNAGUET",
        addressLine2: null,
        postalCode: "31200",
        city: "TOULOUSE",
        country: "FR",
        latitude: 43.6407966,
        longitude: 1.439154,
    };

    const selectedRelayPointRow: SelectedRelayPointRow = {
        order_id: 42,
        relay_selection_status: "selected",

        relay_point_id: "033594",
        relay_point_name: "LOCKER 24/7 LE FOURNIL DE MATEF",

        relay_point_address_line1: "171 ROUTE DE LAUNAGUET",
        relay_point_address_line2: null,
        relay_point_postal_code: "31200",
        relay_point_city: "TOULOUSE",
        relay_point_country: "FR",

        relay_point_latitude: "43.6407966",
        relay_point_longitude: "1.439154",

        relay_point_selected_at: new Date(
            "2026-08-07T09:30:00.000Z"
        ),
    };

    beforeEach(() => {
        orderRepository = {
            findRelaySelectionContextByCheckoutSessionId: vi.fn(),
            selectRelayPoint: vi.fn(),
            findRelaySelectionContextByUserAndOrderId: vi.fn(),
        };

        mondialRelayClient = {
            validateRelayPoint: vi.fn(),
        };

        service = new RelayPointService(
            orderRepository as unknown as OrderRepository,
            mondialRelayClient as unknown as MondialRelayClient
        );
    });

    it("validates the relay point with Mondial Relay and stores only the official data", async () => {
        const input: SelectRelayPointInput = {
            checkoutSessionId: "cs_test_123",
            relayPoint: {
                id: "033594",
                country: "FR",
            },
        };

        orderRepository
            .findRelaySelectionContextByCheckoutSessionId
            .mockResolvedValue(relaySelectionContext);

        mondialRelayClient.validateRelayPoint.mockResolvedValue(
            officialRelayPoint
        );

        orderRepository.selectRelayPoint.mockResolvedValue(
            selectedRelayPointRow
        );

        const result = await service.selectRelayPoint(input);

        expect(
            orderRepository
                .findRelaySelectionContextByCheckoutSessionId
        ).toHaveBeenCalledWith("cs_test_123");

        expect(
            mondialRelayClient.validateRelayPoint
        ).toHaveBeenCalledWith({
            relayPointId: "033594",
            country: "FR",
        });

        expect(
            orderRepository.selectRelayPoint
        ).toHaveBeenCalledWith(
            42,
            officialRelayPoint
        );

        expect(result).toEqual(selectedRelayPointRow);
    });

    it("does not allow frontend-provided relay details to become the source of truth", async () => {
        const input: SelectRelayPointInput = {
            checkoutSessionId: "cs_test_456",
            relayPoint: {
                id: "033594",
                country: "FR",
            },
        };

        orderRepository
            .findRelaySelectionContextByCheckoutSessionId
            .mockResolvedValue(relaySelectionContext);

        mondialRelayClient.validateRelayPoint.mockResolvedValue(
            officialRelayPoint
        );

        orderRepository.selectRelayPoint.mockResolvedValue(
            selectedRelayPointRow
        );

        await service.selectRelayPoint(input);

        const selectRelayPointCall =
            orderRepository.selectRelayPoint.mock.calls[0];

        expect(selectRelayPointCall).toBeDefined();

        const storedRelayPoint =
            selectRelayPointCall?.[1];

        expect(storedRelayPoint).toEqual(
            officialRelayPoint
        );

        expect(storedRelayPoint).toMatchObject({
            id: "033594",
            name: "LOCKER 24/7 LE FOURNIL DE MATEF",
            addressLine1: "171 ROUTE DE LAUNAGUET",
            postalCode: "31200",
            city: "TOULOUSE",
        });
    });

    it("does not call Mondial Relay when the order is not paid", async () => {
        const input: SelectRelayPointInput = {
            checkoutSessionId: "cs_test_unpaid",
            relayPoint: {
                id: "033594",
                country: "FR",
            },
        };

        orderRepository
            .findRelaySelectionContextByCheckoutSessionId
            .mockResolvedValue({
                ...relaySelectionContext,
                order_status: "pending",
                payment_status: "pending",
            });

        await expect(
            service.selectRelayPoint(input)
        ).rejects.toThrow(
            "The order must be paid before selecting a relay point"
        );

        expect(
            mondialRelayClient.validateRelayPoint
        ).not.toHaveBeenCalled();

        expect(
            orderRepository.selectRelayPoint
        ).not.toHaveBeenCalled();
    });

    it("does not save anything when Mondial Relay validation fails", async () => {
        const input: SelectRelayPointInput = {
            checkoutSessionId: "cs_test_invalid_relay",
            relayPoint: {
                id: "999999",
                country: "FR",
            },
        };

        orderRepository
            .findRelaySelectionContextByCheckoutSessionId
            .mockResolvedValue(relaySelectionContext);

        mondialRelayClient.validateRelayPoint.mockRejectedValue(
            new Error("Mondial Relay point not found")
        );

        await expect(
            service.selectRelayPoint(input)
        ).rejects.toThrow(
            "Mondial Relay point not found"
        );

        expect(
            orderRepository.selectRelayPoint
        ).not.toHaveBeenCalled();
    });

    it("returns pending relay selection for a paid Mondial Relay order", async () => {
        orderRepository
            .findRelaySelectionContextByCheckoutSessionId
            .mockResolvedValue({
                ...relaySelectionContext,
                relay_selection_status: "pending",
                relay_point_address_line1: null,
                relay_point_address_line2: null,
                relay_point_postal_code: null,
                relay_point_city: null,
                relay_point_country: null,
                relay_point_latitude: null,
                relay_point_longitude: null,
            });

        const result =
            await service.getRelaySelection(
                "cs_test_pending"
            );

        expect(result).toEqual({
            orderId: 42,
            orderStatus: "paid",
            paymentStatus: "paid",
            shippingMethod: "mondial_relay",
            relaySelectionStatus: "pending",
            relayPoint: null,
        });
    });

    it("returns the selected relay point", async () => {
        orderRepository
            .findRelaySelectionContextByCheckoutSessionId
            .mockResolvedValue({
                ...relaySelectionContext,
                relay_selection_status: "selected",
                relay_point_id: "033594",
                relay_point_name:
                    "LOCKER 24/7 LE FOURNIL DE MATEF",
                relay_point_address_line1:
                    "171 ROUTE DE LAUNAGUET",
                relay_point_address_line2: null,
                relay_point_postal_code: "31200",
                relay_point_city: "TOULOUSE",
                relay_point_country: "FR",
                relay_point_latitude: "43.6407966",
                relay_point_longitude: "1.439154",
            });

        const result =
            await service.getRelaySelection(
                "cs_test_selected"
            );

        expect(result.relaySelectionStatus).toBe(
            "selected"
        );

        expect(result.relayPoint).toEqual({
            id: "033594",
            name: "LOCKER 24/7 LE FOURNIL DE MATEF",
            addressLine1:
                "171 ROUTE DE LAUNAGUET",
            addressLine2: null,
            postalCode: "31200",
            city: "TOULOUSE",
            country: "FR",
            latitude: 43.6407966,
            longitude: 1.439154,
        });
    });

    it("returns relay selection details for the authenticated order owner", async () => {
        orderRepository
            .findRelaySelectionContextByUserAndOrderId
            .mockResolvedValue({
                ...relaySelectionContext,
                relay_selection_status: "pending",
                relay_point_address_line1: null,
                relay_point_address_line2: null,
                relay_point_postal_code: null,
                relay_point_city: null,
                relay_point_country: null,
                relay_point_latitude: null,
                relay_point_longitude: null,
            });

        const result =
            await service.getRelaySelectionForUser(
                10,
                42
            );

        expect(
            orderRepository
                .findRelaySelectionContextByUserAndOrderId
        ).toHaveBeenCalledWith(
            10,
            42
        );

        expect(result).toMatchObject({
            orderId: 42,
            relaySelectionStatus: "pending",
            relayPoint: null,
        });
    });

    it("validates and stores the official relay point for the authenticated order owner", async () => {
        orderRepository
            .findRelaySelectionContextByUserAndOrderId
            .mockResolvedValue(relaySelectionContext);

        mondialRelayClient
            .validateRelayPoint
            .mockResolvedValue(
                officialRelayPoint
            );

        orderRepository
            .selectRelayPoint
            .mockResolvedValue(
                selectedRelayPointRow
            );

        await service.selectRelayPointForUser(
            10,
            42,
            {
                id: "033594",
                country: "FR",
            }
        );

        expect(
            orderRepository
                .findRelaySelectionContextByUserAndOrderId
        ).toHaveBeenCalledWith(
            10,
            42
        );

        expect(
            mondialRelayClient.validateRelayPoint
        ).toHaveBeenCalledWith({
            relayPointId: "033594",
            country: "FR",
        });

        expect(
            orderRepository.selectRelayPoint
        ).toHaveBeenCalledWith(
            42,
            officialRelayPoint
        );
    });

    it("does not expose or modify an order not owned by the authenticated user", async () => {
        orderRepository
            .findRelaySelectionContextByUserAndOrderId
            .mockResolvedValue(null);

        await expect(
            service.selectRelayPointForUser(
                999,
                42,
                {
                    id: "033594",
                    country: "FR",
                }
            )
        ).rejects.toThrow(
            "Order not found"
        );

        expect(
            mondialRelayClient.validateRelayPoint
        ).not.toHaveBeenCalled();

        expect(
            orderRepository.selectRelayPoint
        ).not.toHaveBeenCalled();
    });

});