ALTER TABLE product_references
ADD COLUMN IF NOT EXISTS weight_grams integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_references_weight_grams_check'
  ) THEN
    ALTER TABLE product_references
    ADD CONSTRAINT product_references_weight_grams_check
    CHECK (weight_grams IS NULL OR weight_grams > 0);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS order_shipments (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id integer NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,

  shipping_method varchar(50) NOT NULL,
  shipping_label varchar(100) NOT NULL,
  shipping_price_cents integer NOT NULL,
  total_weight_grams integer NOT NULL,

  carrier varchar(50),
  tracking_number varchar(100),
  tracking_url text,

  relay_point_id varchar(100),
  relay_point_name varchar(255),
  relay_point_address text,

  status varchar(50) DEFAULT 'pending' NOT NULL,

  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,

  CONSTRAINT order_shipments_price_check
    CHECK (shipping_price_cents >= 0),

  CONSTRAINT order_shipments_total_weight_grams_check
    CHECK (total_weight_grams > 0),

  CONSTRAINT order_shipments_status_check
    CHECK (status IN ('pending', 'label_created', 'shipped', 'delivered', 'failed'))
);