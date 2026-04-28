export type CreateOrderRepositoryInput = {
    userId?: number | null;
    totalPriceCents: number;
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

export type CreateOrderRepositoryOutput = { id: number };

type CreateOrderItemsInput = {
    productId: number;
    productName: string;
    quantity: number;
    unitPriceCents: number;
    customization?: OrderItemCustomization | null;
    finalPreviewUrl?: string | null;
}

export type CreateOrderWithItemsInput = {
  order: CreateOrderRepositoryInput;
  items: CreateOrderItemsInput[];
};

export type OrderItemCustomization = {
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