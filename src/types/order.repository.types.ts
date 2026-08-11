import type { ProductionOption, ShippingMethod } from "../config/order-options.js";
import type { OrderStatus } from "./order.types.js";

export type OrderItemType = "studio" | "shop";

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
  productionOption: ProductionOption;
  productionLabel: string;
  productionPercentage: number;
  productionPriceCents: number;
  professionalLogoReviewEnabled: boolean;
  professionalLogoReviewPriceCents: number;
  promoCodeId?: number | null;
  promoCode?: string | null;
  discountCents: number;
};

export type CreateOrderRepositoryOutput = { id: number };

export type CreateOrderItemsInput = {
  itemType: OrderItemType;

  productId?: number | null;
  shopProductId?: number | null;

  productName: string;
  quantity: number;
  unitPriceCents: number;
  customization?: OrderItemCustomization | null;
  finalPreviewUrl?: string | null;

  shopProductVariantId?: number | null;
};

export type CreateOrderWithItemsInput = {
  order: CreateOrderRepositoryInput;
  shipping: CreateOrderShipmentInput;
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

export type RelaySelectionStatus =  | "not_required"  | "pending"  | "selected";

export type OrderSummaryRow = {
  id: number;
  status: string;
  total_price_cents: number;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_email: string;
  created_at: Date;
  production_option: string;
  production_label: string;
  production_percentage: number;
  production_price_cents: number;
  professional_logo_review_enabled: boolean;
  professional_logo_review_price_cents: number;
  promo_code_id: number | null;
  promo_code: string | null;
  discount_cents: number;

  shipping_method: string | null;
  relay_selection_status: RelaySelectionStatus | null;
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

  variant_size_label: string | null;
  variant_color_name: string | null;
  variant_color_hex: string | null;
  variant_sku: string | null;
  variant_image_url: string | null;
};

export type OrderDetailsRow = OrderSummaryRow & {
  customer_phone: string | null;

  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_postal_code: string | null;
  shipping_city: string | null;
  shipping_country: string | null;

  items: OrderItemDetailsRow[];

  shipping_method: string | null;
  shipping_label: string | null;
  shipping_price_cents: number | null;
  total_weight_grams: number | null;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipping_status: string | null;

  relay_point_id: string | null;
  relay_point_name: string | null;
  relay_point_address_line1: string | null;
  relay_point_address_line2: string | null;
  relay_point_postal_code: string | null;
  relay_point_city: string | null;
  relay_point_country: string | null;
  relay_point_selected_at: Date | null;
};

export type OrderMetaPurchaseItemRow = {
  product_id: number | null;
  product_name: string;
  quantity: number;
  shop_product_id: number | null;
  shop_product_variant_id: number | null;
};

export type OrderMetaPurchaseRow = {
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_phone: string | null;
  id: number;
  items: OrderMetaPurchaseItemRow[];
  meta_purchase_event_sent_at: Date | null;
  status: string;
  total_price_cents: number;
};

export type UpdateOrderStatusRepositoryInput = {
  orderId: number;
  status: OrderStatus;
};

export type CreateOrderShipmentInput = {
  method: ShippingMethod;
  label: string;
  priceCents: number;
  totalWeightGrams: number;
};

export type ProductReferenceWeightRow = {
  product_id: number;
  weight_grams: number | null;
};

export type UpdateOrderShippingInput = {
  orderId: number;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  status?: "pending" | "label_created" | "shipped" | "delivered" | "failed";
};

export type ShopProductWeightRow = {
  id: number;
  weight_grams: number;
};

