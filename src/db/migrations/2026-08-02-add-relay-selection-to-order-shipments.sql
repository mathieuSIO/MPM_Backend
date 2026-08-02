ALTER TABLE order_shipments
ADD COLUMN
IF NOT EXISTS relay_selection_status varchar
(20)
    DEFAULT 'not_required'
    NOT NULL,

ADD COLUMN
IF NOT EXISTS relay_point_address_line1 text,

ADD COLUMN
IF NOT EXISTS relay_point_address_line2 text,

ADD COLUMN
IF NOT EXISTS relay_point_postal_code varchar
(20),

ADD COLUMN
IF NOT EXISTS relay_point_city varchar
(150),

ADD COLUMN
IF NOT EXISTS relay_point_country varchar
(10),

ADD COLUMN
IF NOT EXISTS relay_point_latitude numeric
(10, 7),

ADD COLUMN
IF NOT EXISTS relay_point_longitude numeric
(10, 7),

ADD COLUMN
IF NOT EXISTS relay_point_selected_at
    timestamp without time zone;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_shipments_relay_selection_status_check'
    ) THEN
    ALTER TABLE order_shipments
        ADD CONSTRAINT order_shipments_relay_selection_status_check
        CHECK (
            relay_selection_status IN (
                'not_required',
                'pending',
                'selected'
            )
        );
END
IF;
END $$;

UPDATE order_shipments
SET relay_selection_status =
    CASE
        WHEN shipping_method <> 'mondial_relay'
            THEN 'not_required'
        WHEN relay_point_id IS NOT NULL
            THEN 'selected'
        ELSE 'pending'
    END;