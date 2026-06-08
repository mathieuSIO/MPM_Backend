ALTER TABLE shop_product_variants
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS image_storage_key text;