CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE inventory_policy_type AS enum('block', 'allow');

CREATE TYPE product_variant_type AS enum('default', 'variant');

CREATE TYPE store_order_shipping_type AS enum('pickup', 'delivery', 'shipment');

CREATE TYPE store_order_fulfillment_status AS enum('fulfilled', 'partial', 'restocked');

CREATE TYPE store_order_cancel_reason AS enum(
    'customer',
    'fraud',
    'inventory',
    'declined',
    'other'
);

CREATE TYPE store_order_financial_status AS enum(
    'pending',
    'paid',
    'refunded',
    'partially_refunded',
    'partially_paid'
);

CREATE TYPE store_order_status AS enum('open', 'closed', 'cancelled');

CREATE TYPE store_payment_method_type AS enum(
    'bank_deposit',
    'cash',
    'cash_on_delivery',
    'custom',
    'external_credit',
    'external_debit',
    'gift_card',
    'money_order',
    'store_credit',
    'credit_card',
    'debit_card',
    'providers'
);

CREATE TABLE IF NOT EXISTS unstock_user (
    id UUID DEFAULT uuid_generate_v4 (),
    first_name VARCHAR(200),
    last_name VARCHAR(200),
    email VARCHAR(200),
    phone VARCHAR(200),
    currency VARCHAR(3) DEFAULT 'PAB',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS user_address (
    id UUID DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES unstock_user(id),
    first_name VARCHAR(200),
    last_name VARCHAR(200),
    company VARCHAR(200),
    address_1 VARCHAR(200),
    address_2 VARCHAR(200),
    city VARCHAR(200),
    province VARCHAR(200),
    country VARCHAR(200),
    phone VARCHAR(200),
    country_code VARCHAR(200),
    country_name VARCHAR(200),
    is_default BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store (
    id UUID DEFAULT uuid_generate_v4 (),
    "name" VARCHAR(200) DEFAULT '' NOT NULL,
    legal_bussiness_name VARCHAR(200) DEFAULT '' NOT NULL,
    timezone VARCHAR(20) DEFAULT 'UTC−05:00',
    currency VARCHAR(3) DEFAULT 'PAB',
    weight_unit VARCHAR(3) DEFAULT 'kg',
    domain VARCHAR(200) DEFAULT '',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_costumer (
    id UUID DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES unstock_user(id),
    store_id UUID REFERENCES store(id),
    accept_marketing BOOLEAN DEFAULT false,
    note TEXT DEFAULT '',
    tags TEXT [] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_location(
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    "name" VARCHAR(200) DEFAULT '' NOT NULL,
    address text not null default '',
    address_alt text not null default '',
    latitude text default '',
    longitude text default '',
    location GEOGRAPHY(Point),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_user (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    "name" VARCHAR(200),
    "email" VARCHAR(200),
    "password" VARCHAR (200),
    "type" VARCHAR(200),
    "is_activated" BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_category (
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    name VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY (id)
);

/*Force to be unique category by stores*/
ALTER TABLE product_category
add constraint unique_category_in_store unique (store_id, name);

CREATE TABLE IF NOT EXISTS product (
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    "name" VARCHAR(150) DEFAULT '',
    /* Name of the product */
    "body" TEXT DEFAULT '',
    /* Description of the product */
    vendor VARCHAR(200) DEFAULT '',
    tags TEXT [] NOT NULL DEFAULT '{}',
    categories UUID [] NOT NULL DEFAULT '{}',
    is_publish BOOLEAN DEFAULT false,
    is_archive BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    publish_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

/*create index product_tags_index on product using gin (tags);*/
create index product_categories_index on product using gin (categories);

CREATE TABLE IF NOT EXISTS product_image (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    src TEXT DEFAULT '',
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_variant (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    "type" product_variant_type default 'default',
    sku TEXT DEFAULT '',
    barcode TEXT DEFAULT '',
    price NUMERIC(5, 2) DEFAULT 0,
    currency VARCHAR(3) default 'PAB',
    inventory_policy inventory_policy_type default 'block',
    quantity INTEGER default 0,
    images UUID [] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    "options" UUID [] DEFAULT '{}',
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_option (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    position INTEGER DEFAULT 0,
    name VARCHAR(100) DEFAULT 'default',
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_option_value(
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    position INTEGER DEFAULT 0,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_order (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    address json NOT NULL DEFAULT '{}',
    sub_total NUMERIC(5, 2) DEFAULT 0,
    tax NUMERIC(5, 2) DEFAULT 0,
    total NUMERIC(5, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PAB',
    shipping_type store_order_shipping_type DEFAULT 'pickup',
    fulfillment_status store_order_fulfillment_status DEFAULT NULL,
    financial_status store_order_financial_status DEFAULT 'pending',
    email VARCHAR(200),
    phone VARCHAR(200),
    status store_order_status DEFAULT 'open',
    items json NOT NULL DEFAULT '{}',
    message VARCHAR(240),
    cancel_reason store_order_cancel_reason DEFAULT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    closed_at TIMESTAMP DEFAULT NULL,
    cancelled_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_payment_method (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    "name" VARCHAR(200),
    "type" store_payment_method_type DEFAULT 'custom',
    additional_details TEXT DEFAULT '',
    payment_instructions TEXT DEFAULT '',
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_shipping_zone (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    "name" VARCHAR(200),
    "location" GEOMETRY,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_pickup_location(
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    "name" VARCHAR(200) DEFAULT '' NOT NULL,
    additional_details TEXT DEFAULT '',
    latitude text default '',
    longitude text default '',
    location GEOGRAPHY(Point),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_location_payment_method (
    id UUID DEFAULT uuid_generate_v4 (),
    store_payment_method_id UUID REFERENCES store_payment_method(id),
    shipping_zone_id UUID REFERENCES store_shipping_zone(id) DEFAULT NULL,
    store_pickup_location_id UUID REFERENCES store_pickup_location(id) DEFAULT NULL,
    price NUMERIC(5, 2) DEFAULT 0,
    currency VARCHAR(3) default 'PAB',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

/*FUNCTIONS*/
CREATE OR REPLACE FUNCTION validate_add_variant() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE default_count INTEGER;

BEGIN
SELECT COUNT(*) INTO default_count
FROM product_variant
WHERE product_id = new.product_id
    AND "type" = 'default';

if new.type = 'default' then new.options := '{}';

end if;

IF new.type = 'default'
and default_count <> 0 THEN RAISE EXCEPTION 'product already have default variant';

END IF;

RETURN NEW;

END;

$$;

/*TRIGGERS*/
CREATE TRIGGER add_variant BEFORE
INSERT ON product_variant FOR EACH ROW EXECUTE PROCEDURE validate_add_variant();