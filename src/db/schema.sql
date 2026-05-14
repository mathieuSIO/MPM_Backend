--
-- PostgreSQL database dump
--

\restrict QGLpx8bhJAaCzM7udW0rbdbOmNwBfH8rX4SAeXOpVCbbPDGSv5nXZWofSMsW3SH

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_assets; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.order_assets (
    id integer NOT NULL,
    order_item_id integer NOT NULL,
    file_url text NOT NULL,
    file_name character varying(255),
    mime_type character varying(100),
    file_size_bytes integer,
    asset_type character varying(50) DEFAULT 'uploaded_logo'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_assets_asset_type_check CHECK (((asset_type)::text = ANY ((ARRAY['uploaded_logo'::character varying, 'uploaded_design'::character varying, 'source_file'::character varying, 'final_preview'::character varying])::text[]))),
    CONSTRAINT order_assets_file_size_bytes_check CHECK ((file_size_bytes >= 0))
);


ALTER TABLE public.order_assets OWNER TO mpm_mathieu;

--
-- Name: order_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.order_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_assets_id_seq OWNER TO mpm_mathieu;

--
-- Name: order_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.order_assets_id_seq OWNED BY public.order_assets.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer,
    product_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price_cents integer NOT NULL,
    total_price_cents integer NOT NULL,
    customization jsonb,
    final_preview_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_total_price_cents_check CHECK ((total_price_cents >= 0)),
    CONSTRAINT order_items_unit_price_cents_check CHECK ((unit_price_cents >= 0))
);


ALTER TABLE public.order_items OWNER TO mpm_mathieu;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO mpm_mathieu;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    total_price_cents integer NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_first_name character varying(100),
    customer_last_name character varying(100),
    customer_phone character varying(50),
    shipping_address_line1 character varying(255),
    shipping_address_line2 character varying(255),
    shipping_postal_code character varying(20),
    shipping_city character varying(100),
    shipping_country character varying(100) DEFAULT 'France'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    production_option character varying(20) DEFAULT 'standard'::character varying NOT NULL,
    production_label character varying(100) DEFAULT 'Standard'::character varying NOT NULL,
    production_price_cents integer DEFAULT 0 NOT NULL,
    production_percentage integer DEFAULT 0 NOT NULL,
    professional_logo_review_enabled boolean DEFAULT false NOT NULL,
    professional_logo_review_price_cents integer DEFAULT 0 NOT NULL,
    CONSTRAINT orders_production_option_check CHECK (((production_option)::text = ANY ((ARRAY['standard'::character varying, 'rapide'::character varying, 'premium'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'processing'::character varying, 'shipped'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT orders_total_price_cents_check CHECK ((total_price_cents >= 0))
);


ALTER TABLE public.orders OWNER TO mpm_mathieu;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO mpm_mathieu;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    provider character varying(30) NOT NULL,
    provider_payment_id character varying(255),
    provider_checkout_session_id character varying(255),
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    amount_cents integer NOT NULL,
    currency character varying(10) DEFAULT 'eur'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    paid_at timestamp without time zone,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'cancelled'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.payments OWNER TO mpm_mathieu;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO mpm_mathieu;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: product_reference_colors; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.product_reference_colors (
    id integer NOT NULL,
    product_reference_id integer NOT NULL,
    color_name character varying(100) NOT NULL,
    color_code character varying(100),
    swatch_hex character varying(20),
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.product_reference_colors OWNER TO mpm_mathieu;

--
-- Name: product_reference_colors_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.product_reference_colors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_reference_colors_id_seq OWNER TO mpm_mathieu;

--
-- Name: product_reference_colors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.product_reference_colors_id_seq OWNED BY public.product_reference_colors.id;


--
-- Name: product_reference_sizes; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.product_reference_sizes (
    id integer NOT NULL,
    product_reference_id integer NOT NULL,
    size_label character varying(20) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.product_reference_sizes OWNER TO mpm_mathieu;

--
-- Name: product_reference_sizes_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.product_reference_sizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_reference_sizes_id_seq OWNER TO mpm_mathieu;

--
-- Name: product_reference_sizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.product_reference_sizes_id_seq OWNED BY public.product_reference_sizes.id;


--
-- Name: product_references; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.product_references (
    id integer NOT NULL,
    product_id integer NOT NULL,
    reference_name character varying(255) NOT NULL,
    supplier_name character varying(255),
    supplier_reference character varying(255),
    grammage_gsm integer,
    material text,
    fit character varying(100),
    description text,
    base_price_cents integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_references_base_price_cents_check CHECK ((base_price_cents >= 0))
);


ALTER TABLE public.product_references OWNER TO mpm_mathieu;

--
-- Name: product_references_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.product_references_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_references_id_seq OWNER TO mpm_mathieu;

--
-- Name: product_references_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.product_references_id_seq OWNED BY public.product_references.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    slug character varying(100) NOT NULL,
    category character varying(100)
);


ALTER TABLE public.products OWNER TO mpm_mathieu;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO mpm_mathieu;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: mpm_mathieu
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(50),
    address_line1 character varying(255),
    address_line2 character varying(255),
    postal_code character varying(20),
    city character varying(100),
    country character varying(100) DEFAULT 'France'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO mpm_mathieu;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: mpm_mathieu
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO mpm_mathieu;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mpm_mathieu
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: order_assets id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.order_assets ALTER COLUMN id SET DEFAULT nextval('public.order_assets_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: product_reference_colors id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_colors ALTER COLUMN id SET DEFAULT nextval('public.product_reference_colors_id_seq'::regclass);


--
-- Name: product_reference_sizes id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_sizes ALTER COLUMN id SET DEFAULT nextval('public.product_reference_sizes_id_seq'::regclass);


--
-- Name: product_references id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_references ALTER COLUMN id SET DEFAULT nextval('public.product_references_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: order_assets order_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.order_assets
    ADD CONSTRAINT order_assets_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_reference_colors product_reference_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_colors
    ADD CONSTRAINT product_reference_colors_pkey PRIMARY KEY (id);


--
-- Name: product_reference_colors product_reference_colors_product_reference_id_color_name_key; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_colors
    ADD CONSTRAINT product_reference_colors_product_reference_id_color_name_key UNIQUE (product_reference_id, color_name);


--
-- Name: product_reference_sizes product_reference_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_sizes
    ADD CONSTRAINT product_reference_sizes_pkey PRIMARY KEY (id);


--
-- Name: product_reference_sizes product_reference_sizes_product_reference_id_size_label_key; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_sizes
    ADD CONSTRAINT product_reference_sizes_product_reference_id_size_label_key UNIQUE (product_reference_id, size_label);


--
-- Name: product_references product_references_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_references
    ADD CONSTRAINT product_references_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_unique UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: order_assets order_assets_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.order_assets
    ADD CONSTRAINT order_assets_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: product_reference_colors product_reference_colors_product_reference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_colors
    ADD CONSTRAINT product_reference_colors_product_reference_id_fkey FOREIGN KEY (product_reference_id) REFERENCES public.product_references(id) ON DELETE CASCADE;


--
-- Name: product_reference_sizes product_reference_sizes_product_reference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_reference_sizes
    ADD CONSTRAINT product_reference_sizes_product_reference_id_fkey FOREIGN KEY (product_reference_id) REFERENCES public.product_references(id) ON DELETE CASCADE;


--
-- Name: product_references product_references_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mpm_mathieu
--

ALTER TABLE ONLY public.product_references
    ADD CONSTRAINT product_references_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QGLpx8bhJAaCzM7udW0rbdbOmNwBfH8rX4SAeXOpVCbbPDGSv5nXZWofSMsW3SH

