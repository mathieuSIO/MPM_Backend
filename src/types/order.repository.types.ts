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

export type CreateOrderItemsInput = {
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

export type OrderSummaryRow = {
  id: number;
  status: string;
  total_price_cents: number;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_email: string;
  created_at: Date;
};

export type OrderItemDetailsRow = {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
  customization: OrderItemCustomization | null;
  final_preview_url: string | null;
};

export type OrderDetailsRow = OrderSummaryRow & {
  customer_phone: string | null;

  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_postal_code: string | null;
  shipping_city: string | null;
  shipping_country: string | null;

  items: OrderItemDetailsRow[];
};