ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS item_type varchar(20) DEFAULT 'studio' NOT NULL,
ADD COLUMN IF NOT EXISTS shop_product_id integer REFERENCES shop_products(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_item_type_check'
  ) THEN
    ALTER TABLE order_items
    ADD CONSTRAINT order_items_item_type_check
    CHECK (item_type IN ('studio', 'shop'));
  END IF;
END $$;

ALTER TABLE shop_products
ADD COLUMN IF NOT EXISTS weight_grams integer DEFAULT 200 NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'shop_products_weight_grams_check'
  ) THEN
    ALTER TABLE shop_products
    ADD CONSTRAINT shop_products_weight_grams_check
    CHECK (weight_grams > 0);
  END IF;
END $$;