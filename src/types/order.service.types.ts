export type CreateOrderWithItemsServiceInput = {
    order: {
        userId?: number | null;

        customerEmail: string;
        customerFirstName?: string | null;
        customerLastName?: string | null;
        customerPhone?: string | null;

        shippingAddressLine1?: string | null;
        shippingAddressLine2?: string | null;
        shippingPostalCode?: string | null;
        shippingCity?: string | null;
        shippingCountry?: string | null;
    };

    items: {
        productId: number;
        productName: string;
        quantity: number;
        unitPriceCents: number;
        customization?: OrderItemCustomizationServiceInput | null;
        finalPreviewUrl?: string | null;
    }[];
};

type OrderItemCustomizationServiceInput = {
    product: {
        color: string;
        size: string;
    };
    print: {
        technique: "dtf" | "embroidery" | "screen_printing";
        printArea: "front" | "back" | "heart" | "sleeve";
    };
    elements: {
        type: "logo" | "text";
        url?: string;
        text?: string;
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
    }[];
};
