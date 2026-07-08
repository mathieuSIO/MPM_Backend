import { describe, expect, it } from "vitest";

import { getShippingPriceCents } from "./order-options.js";

describe("getShippingPriceCents", () => {
  it("returns the matching Mondial Relay price for weight brackets", () => {
    expect(getShippingPriceCents(1)).toBe(490);
    expect(getShippingPriceCents(500)).toBe(490);
    expect(getShippingPriceCents(501)).toBe(690);
    expect(getShippingPriceCents(25000)).toBe(3290);
  });

  it("rejects weights above the supported shipping range", () => {
    expect(() => getShippingPriceCents(25001)).toThrow(
      "Unsupported shipping weight"
    );
  });
});
