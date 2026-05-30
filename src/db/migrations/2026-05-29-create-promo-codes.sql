CREATE TABLE IF NOT EXISTS promo_codes (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  code varchar(50) NOT NULL UNIQUE,

  discount_type varchar(20) NOT NULL,
  discount_value integer NOT NULL,

  minimum_order_cents integer DEFAULT 0 NOT NULL,

  max_uses integer,
  current_uses integer DEFAULT 0 NOT NULL,

  starts_at timestamp without time zone,
  expires_at timestamp without time zone,

  is_active boolean DEFAULT true NOT NULL,

  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,

  CONSTRAINT promo_codes_discount_type_check
    CHECK (discount_type IN ('percentage', 'fixed_amount')),

  CONSTRAINT promo_codes_discount_value_check
    CHECK (discount_value > 0),

  CONSTRAINT promo_codes_minimum_order_cents_check
    CHECK (minimum_order_cents >= 0),

  CONSTRAINT promo_codes_current_uses_check
    CHECK (current_uses >= 0),

  CONSTRAINT promo_codes_max_uses_check
    CHECK (max_uses IS NULL OR max_uses > 0),

  CONSTRAINT promo_codes_current_uses_max_uses_check
    CHECK (max_uses IS NULL OR current_uses <= max_uses)
);