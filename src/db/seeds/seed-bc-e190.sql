BEGIN;

WITH product_upsert AS (
  INSERT INTO products (
    name,
    type,
    slug,
    category,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    'T-shirt',
    'tshirt',
    't-shirt',
    'textile',
    true,
    now(),
    now()
  )
  ON CONFLICT (slug)
  DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    category = EXCLUDED.category,
    is_active = true,
    updated_at = now()
  RETURNING id
),

updated_reference AS (
  UPDATE product_references pr
  SET
    reference_name = 'B&C E190',
    supplier_name = 'B&C',
    supplier_reference = 'E190',
    grammage_gsm = 190,
    material = '100% coton pré-rétréci à fil de chaîne continu ring-spun',
    fit = 'Tubulaire',
    description = 'T-shirt B&C E190, coupe classique, adapté à la personnalisation textile.',
    base_price_cents = 400,
    weight_grams = 190,
    is_active = true,
    updated_at = now()
  FROM product_upsert p
  WHERE pr.product_id = p.id
    AND pr.supplier_name = 'B&C'
    AND pr.supplier_reference = 'E190'
  RETURNING pr.id
),

inserted_reference AS (
  INSERT INTO product_references (
    product_id,
    reference_name,
    supplier_name,
    supplier_reference,
    grammage_gsm,
    material,
    fit,
    description,
    base_price_cents,
    weight_grams,
    is_active,
    created_at,
    updated_at
  )
  SELECT
    p.id,
    'B&C E190',
    'B&C',
    'E190',
    190,
    '100% coton pré-rétréci à fil de chaîne continu ring-spun',
    'Tubulaire',
    'T-shirt B&C E190, coupe classique, adapté à la personnalisation textile.',
    400,
    190,
    true,
    now(),
    now()
  FROM product_upsert p
  WHERE NOT EXISTS (SELECT 1 FROM updated_reference)
  RETURNING id
),

reference_target AS (
  SELECT id FROM updated_reference
  UNION ALL
  SELECT id FROM inserted_reference
),

sizes_seed AS (
  INSERT INTO product_reference_sizes (
    product_reference_id,
    size_label,
    sort_order,
    is_active
  )
  SELECT
    r.id,
    v.size_label,
    v.sort_order,
    true
  FROM reference_target r
  CROSS JOIN (
    VALUES
      ('XS', 1),
      ('S', 2),
      ('M', 3),
      ('L', 4),
      ('XL', 5),
      ('XXL', 6),
      ('XXXL', 7),
      ('XXXXL', 8)
  ) AS v(size_label, sort_order)
  ON CONFLICT (product_reference_id, size_label)
  DO UPDATE SET
    sort_order = EXCLUDED.sort_order,
    is_active = true
),

colors_seed AS (
  INSERT INTO product_reference_colors (
    product_reference_id,
    color_name,
    color_code,
    swatch_hex,
    is_active
  )
  SELECT
    r.id,
    v.color_name,
    v.color_code,
    v.swatch_hex,
    true
  FROM reference_target r
  CROSS JOIN (
    VALUES
      ('Blanc', 'white', '#FFFFFF'),
      ('Noir', 'black', '#111111')
  ) AS v(color_name, color_code, swatch_hex)
  ON CONFLICT (product_reference_id, color_name)
  DO UPDATE SET
    color_code = EXCLUDED.color_code,
    swatch_hex = EXCLUDED.swatch_hex,
    is_active = true
)

SELECT 'B&C E190 seed imported successfully' AS result;

COMMIT;