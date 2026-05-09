export type ProductRow = {
  id: number;
  slug: string;
  name: string;
  type: string;
  category: string | null;
  is_active: boolean;
};

export type ProductReferenceRow = {
  id: number;
  product_id: number;
  reference_name: string;
  supplier_name: string | null;
  supplier_reference: string | null;
  grammage_gsm: number | null;
  material: string | null;
  fit: string | null;
  description: string | null;
  base_price_cents: number;
  is_active: boolean;
};

export type ProductReferenceSizeRow = {
  id: number;
  product_reference_id: number;
  size_label: string;
  sort_order: number;
  is_active: boolean;
};

export type ProductReferenceColorRow = {
  id: number;
  product_reference_id: number;
  color_name: string;
  color_code: string | null;
  swatch_hex: string | null;
  is_active: boolean;
};

export type ProductCatalogItem = {
  id: number;
  slug: string;
  name: string;
  type: string;
  category: string | null;
  references: ProductCatalogReference[];
};

export type ProductCatalogReference = {
  id: number;
  referenceName: string;
  supplierName: string | null;
  supplierReference: string | null;
  grammageGsm: number | null;
  material: string | null;
  fit: string | null;
  description: string | null;
  basePriceCents: number;
  sizes: string[];
  colors: ProductCatalogColor[];
};

export type ProductCatalogColor = {
  id: number;
  name: string;
  code: string | null;
  swatchHex: string | null;
};