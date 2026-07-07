ALTER TABLE orders
ADD COLUMN IF NOT EXISTS meta_purchase_event_sent_at timestamp without time zone;
