export const ORDER_STATUSES = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "completed",
    "cancelled",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];