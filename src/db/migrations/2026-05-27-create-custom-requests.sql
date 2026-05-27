CREATE TABLE IF NOT EXISTS custom_requests (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  user_id integer REFERENCES users(id) ON DELETE SET NULL,

  customer_email varchar(255) NOT NULL,
  customer_first_name varchar(100),
  customer_last_name varchar(100),
  customer_phone varchar(50),

  message text NOT NULL,
  status varchar(50) DEFAULT 'new' NOT NULL,

  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp without time zone DEFAULT now() NOT NULL,

  CONSTRAINT custom_requests_status_check
    CHECK (status IN ('new', 'in_progress', 'quoted', 'closed')),

  CONSTRAINT custom_requests_message_check
    CHECK (char_length(message) >= 10)
);