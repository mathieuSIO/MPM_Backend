CREATE TABLE IF NOT EXISTS shop_product_images (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  shop_product_id integer NOT NULL REFERENCES shop_products(id) ON DELETE CASCADE,

  image_url text NOT NULL,
  image_storage_key text,

  alt_text varchar(255),
  display_order integer DEFAULT 0 NOT NULL,

  is_active boolean DEFAULT true NOT NULL,

  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_product_images_product_id
ON shop_product_images(shop_product_id);