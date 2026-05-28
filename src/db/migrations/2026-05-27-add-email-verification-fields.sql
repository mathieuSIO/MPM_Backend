ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified_at timestamp without time zone,
ADD COLUMN IF NOT EXISTS email_verification_token_hash text,
ADD COLUMN IF NOT EXISTS email_verification_expires_at timestamp without time zone;