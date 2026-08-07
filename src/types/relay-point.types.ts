export type RelaySelectionStatus =
    | "not_required"
    | "pending"
    | "selected";

export type SelectRelayPointInput = {
    checkoutSessionId: string;

    relayPoint: {
        id: string;
        country: string;
    };
};

export type RelaySelectionContextRow = {
    order_id: number;
    order_status: string;

    payment_status: string;

    shipping_method: string;
    shipment_status: string;
    relay_selection_status: RelaySelectionStatus;

    relay_point_id: string | null;
    relay_point_name: string | null;
};

export type SelectedRelayPointRow = {
    order_id: number;
    relay_selection_status: RelaySelectionStatus;

    relay_point_id: string;
    relay_point_name: string;

    relay_point_address_line1: string;
    relay_point_address_line2: string | null;
    relay_point_postal_code: string;
    relay_point_city: string;
    relay_point_country: string;

    relay_point_latitude: string | null;
    relay_point_longitude: string | null;

    relay_point_selected_at: Date;
};