import { describe, expect, it } from "vitest";

import { createOrderSchema, estimateShippingSchema } from "./order.schema.js";

describe("order schemas", () => {
  it("accepts a mixed studio and shop order payload", () => {
    const result = createOrderSchema.safeParse({
      items: [
        {
          itemType: "studio",
          productId: 100,
          productName: "T-shirt studio",
          quantity: 2,
          unitPriceCents: 2500,
        },
        {
          itemType: "shop",
          productName: "T-shirt boutique",
          quantity: 1,
          shopProductId: 10,
          shopProductVariantId: 20,
          unitPriceCents: 1800,
        },
      ],
      order: {
        customerEmail: "client@mpm.test",
        professionalLogoReviewEnabled: true,
      },
      promoCode: "WELCOME10",
    });

    expect(result.success).toBe(true);
  });

  it("rejects orders without items", () => {
    const result = createOrderSchema.safeParse({
      items: [],
      order: {
        customerEmail: "client@mpm.test",
      },
    });

    expect(result.success).toBe(false);
  });

  it("accepts shipping estimates for shop products", () => {
    const result = estimateShippingSchema.safeParse({
      items: [
        {
          itemType: "shop",
          quantity: 2,
          shopProductId: 10,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
