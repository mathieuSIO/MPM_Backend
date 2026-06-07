CREATE TABLE IF NOT EXISTS shop_product_variants (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  shop_product_id integer NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,

  size_label varchar(20) NOT NULL,
  color_name varchar(100) NOT NULL,
  color_hex varchar(20),

  sku varchar(100),

  price_cents integer,
  stock_quantity integer DEFAULT 0 NOT NULL,

  is_active boolean DEFAULT true NOT NULL,

  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,

  CONSTRAINT shop_product_variants_price_check
    CHECK (price_cents IS NULL OR price_cents >= 0),

  CONSTRAINT shop_product_variants_stock_check
    CHECK (stock_quantity >= 0),

  CONSTRAINT shop_product_variants_unique_variant
    UNIQUE (shop_product_id, size_label, color_name)
);