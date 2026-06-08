ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS shop_product_variant_id integer
REFERENCES shop_product_variants(id)
ON DELETE SET NULL;