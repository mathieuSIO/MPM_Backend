CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),

  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),

  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  postal_code VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'France',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,

  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'paid',
      'in_production',
      'shipped',
      'cancelled'
    )),

  total_price_cents INTEGER NOT NULL CHECK (total_price_cents >= 0),

  customer_email VARCHAR(255) NOT NULL,
  customer_first_name VARCHAR(100),
  customer_last_name VARCHAR(100),
  customer_phone VARCHAR(50),

  shipping_address_line1 VARCHAR(255),
  shipping_address_line2 VARCHAR(255),
  shipping_postal_code VARCHAR(20),
  shipping_city VARCHAR(100),
  shipping_country VARCHAR(100) DEFAULT 'France',

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,

  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,

  product_name VARCHAR(255) NOT NULL,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  total_price_cents INTEGER NOT NULL CHECK (total_price_cents >= 0),

  customization JSONB,
  final_preview_url TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_assets (
  id SERIAL PRIMARY KEY,

  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,

  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(100),
  file_size_bytes INTEGER CHECK (file_size_bytes >= 0),

  asset_type VARCHAR(50) NOT NULL DEFAULT 'uploaded_logo'
    CHECK (asset_type IN (
      'uploaded_logo',
      'uploaded_design',
      'source_file',
      'final_preview'
    )),

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);