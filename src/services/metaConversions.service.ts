import { createHash } from "node:crypto";

import { env } from "../config/env.js";

type MetaUserData = {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string[];
    fn?: string[];
    ln?: string[];
    ph?: string[];
};

type MetaCustomData = {
    content_ids?: string[];
    content_type: "product";
    currency: "EUR";
    order_id: string;
    value: number;
};

type MetaConversionsEvent = {
    action_source: "website";
    custom_data: MetaCustomData;
    event_id: string;
    event_name: "Purchase";
    event_time: number;
    user_data: MetaUserData;
};

type MetaConversionsPayload = {
    data: MetaConversionsEvent[];
    test_event_code?: string;
};

export type SendMetaPurchaseEventParams = {
    clientIpAddress?: string | null;
    clientUserAgent?: string | null;
    contentIds?: string[];
    email?: string | null;
    eventId: string;
    firstName?: string | null;
    lastName?: string | null;
    orderId: number | string;
    phone?: string | null;
    value: number;
};

export async function sendMetaPurchaseEvent(
    params: SendMetaPurchaseEventParams
): Promise<boolean> {
    if (!env.metaPixelId || !env.metaAccessToken) {
        console.warn("Meta Purchase event skipped: missing Meta configuration.");
        return false;
    }

    const payload = createMetaPurchasePayload(params);
    const endpoint = new URL(
        `https://graph.facebook.com/v20.0/${env.metaPixelId}/events`
    );

    endpoint.searchParams.set("access_token", env.metaAccessToken);

    try {
        const response = await fetch(endpoint, {
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });

        if (!response.ok) {
            console.warn(
                `Meta Purchase event failed with status ${response.status}.`
            );
            return false;
        }

        return true;
    } catch (error) {
        console.warn("Meta Purchase event could not be sent.", error);
        return false;
    }
}

function createMetaPurchasePayload(
    params: SendMetaPurchaseEventParams
): MetaConversionsPayload {
    const customData: MetaCustomData = {
        content_type: "product",
        currency: "EUR",
        order_id: String(params.orderId),
        value: params.value,
    };

    if (params.contentIds && params.contentIds.length > 0) {
        customData.content_ids = params.contentIds;
    }

    const payload: MetaConversionsPayload = {
        data: [
            {
                action_source: "website",
                custom_data: customData,
                event_id: params.eventId,
                event_name: "Purchase",
                event_time: Math.floor(Date.now() / 1000),
                user_data: createUserData(params),
            },
        ],
    };

    if (env.metaTestEventCode) {
        payload.test_event_code = env.metaTestEventCode;
    }

    return payload;
}

function createUserData(params: SendMetaPurchaseEventParams): MetaUserData {
    const userData: MetaUserData = {};
    const email = hashNormalizedValue(params.email);
    const firstName = hashNormalizedValue(params.firstName);
    const lastName = hashNormalizedValue(params.lastName);
    const phone = hashNormalizedValue(normalizePhone(params.phone));

    if (email) {
        userData.em = [email];
    }

    if (firstName) {
        userData.fn = [firstName];
    }

    if (lastName) {
        userData.ln = [lastName];
    }

    if (phone) {
        userData.ph = [phone];
    }

    if (params.clientIpAddress) {
        userData.client_ip_address = params.clientIpAddress;
    }

    if (params.clientUserAgent) {
        userData.client_user_agent = params.clientUserAgent;
    }

    return userData;
}

function hashNormalizedValue(value: string | null | undefined): string | null {
    const normalizedValue = value?.trim().toLowerCase();

    if (!normalizedValue) {
        return null;
    }

    return createHash("sha256").update(normalizedValue).digest("hex");
}

function normalizePhone(phone: string | null | undefined): string | null {
    const normalizedPhone = phone?.replace(/[^\d+]/g, "");

    return normalizedPhone && normalizedPhone.length > 0
        ? normalizedPhone
        : null;
}
