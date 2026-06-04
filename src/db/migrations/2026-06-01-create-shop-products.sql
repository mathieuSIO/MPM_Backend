CREATE TABLE IF NOT EXISTS shop_products (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  description text,

  price_cents integer NOT NULL,

  image_url text,

  is_active boolean DEFAULT true NOT NULL,

  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,

  CONSTRAINT shop_products_price_check
    CHECK (price_cents >= 0)
);