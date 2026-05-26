ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token_hash text,
ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamp without time zone;