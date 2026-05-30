ALTER TABLE orders
ADD COLUMN IF NOT EXISTS promo_code_id integer REFERENCES promo_codes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS promo_code varchar(50),
ADD COLUMN IF NOT EXISTS discount_cents integer DEFAULT 0 NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_discount_cents_check'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_discount_cents_check
    CHECK (discount_cents >= 0);
  END IF;
END $$;