CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE inventory_policy_type AS enum('block', 'allow');

CREATE TYPE store_order_shipping_type AS enum('pickup', 'delivery', 'shipment');

CREATE TYPE store_order_fulfillment_status AS enum('fulfilled', 'partial', 'restocked');

CREATE TYPE store_order_status AS enum('open', 'closed', 'cancelled');

CREATE TYPE store_bill_item_type AS enum('plan', 'users', 'misc');

CREATE TYPE store_bill_status AS enum('pending', 'complete', ' partially_paid', 'paid');

CREATE TYPE authorization_request_type AS enum('admin', 'costumer');

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

CREATE TYPE store_user_type AS enum('owner', 'admin');


/*OUR USERS*/
CREATE TABLE IF NOT EXISTS unstock_user (
    id UUID DEFAULT uuid_generate_v4 (),
    first_name VARCHAR(200),
    last_name VARCHAR(200),
    email VARCHAR(250) not null unique,
    phone VARCHAR(200),
    currency VARCHAR(3) DEFAULT 'PAB',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS unstock_user_address (
    id UUID DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES unstock_user(id) ON DELETE CASCADE,
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
    contact json DEFAULT '{}',
    logo TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_email (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID UNIQUE REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    recipients VARCHAR(255) [] NOT NULL DEFAULT '{}',
    theme json DEFAULT '{}',
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_costumer (
    id UUID DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES unstock_user(id) ON DELETE CASCADE NOT NULL,
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    accept_marketing BOOLEAN DEFAULT FALSE,
    note TEXT DEFAULT '',
    tags TEXT [] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_location(
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE,
    "name" VARCHAR(200) DEFAULT '' NOT NULL,
    address text not null default '',
    address_alt text not null default '',
    latitude text default '',
    longitude text default '',
    location GEOGRAPHY(Point),
    is_pickup BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_user (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    "name" VARCHAR(200),
    "email" VARCHAR(200),
    "type" store_user_type default 'admin',
    "is_activated" BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_category (
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY (id)
);

/*Force to be unique category by stores*/
ALTER TABLE product_category
add constraint unique_category_in_store unique (store_id, name);

CREATE TABLE IF NOT EXISTS product (
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) DEFAULT '',
    /* Name of the product */
    "body" TEXT DEFAULT '',
    /* Description of the product */
    vendor VARCHAR(200) DEFAULT '',
    tags TEXT [] NOT NULL DEFAULT '{}',
    categories UUID [] NOT NULL DEFAULT '{}',
    is_publish BOOLEAN DEFAULT FALSE,
    is_archive BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    slug VARCHAR(200) DEFAULT '',
    option_1 VARCHAR(200) DEFAULT NULL,
    option_2 VARCHAR(200) DEFAULT NULL,
    option_3 VARCHAR(200) DEFAULT NULL,
    product_number INTEGER,
    product_position INTEGER DEFAULT 0 NOT NULL,
    publish_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

/*create index product_tags_index on product using gin (tags);*/
create index product_categories_index on product using gin (categories);

CREATE TABLE IF NOT EXISTS product_image (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id) ON DELETE CASCADE NOT NULL,
    src TEXT DEFAULT '',
    width INTEGER DEFAULT 0,
    height INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    image_position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_variant (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id) ON DELETE CASCADE NOT NULL,
    sku TEXT DEFAULT '',
    barcode TEXT DEFAULT '',
    price NUMERIC(5, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PAB' NOT NULL,
    inventory_policy inventory_policy_type DEFAULT 'block',
    quantity INTEGER DEFAULT 0,
    option_1 VARCHAR(200) DEFAULT NULL,
    option_2 VARCHAR(200) DEFAULT NULL,
    option_3 VARCHAR(200) DEFAULT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    compare_at_price NUMERIC(17, 2),
    "position" INTEGER DEFAULT 0,
    is_taxable BOOLEAN DEFAULT FALSE,
    tax NUMERIC(5,2),
    title VARCHAR(200) DEFAULT '',
    variant_number INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_variant_image(
    id uuid DEFAULT uuid_generate_v4 (),
    product_variant_id UUID REFERENCES product_variant(id) ON DELETE CASCADE NOT NULL,
    product_image_id UUID REFERENCES product_image(id) ON DELETE CASCADE NOT NULL,
    "position" INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_order (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    address json DEFAULT '{}',
    subtotal NUMERIC(17, 2) DEFAULT 0,
    tax NUMERIC(5, 2) DEFAULT 0,
    total NUMERIC(17, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PAB',
    shipping_type store_order_shipping_type DEFAULT 'pickup',
    fulfillment_status store_order_fulfillment_status DEFAULT NULL,
    financial_status store_order_financial_status DEFAULT 'pending',
    status store_order_status DEFAULT 'open',
    message VARCHAR(240),
    cancel_reason store_order_cancel_reason DEFAULT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    cancelled_at TIMESTAMP DEFAULT NULL,
    pickup_location json DEFAULT '{}',
    shipping_option json DEFAULT '{}',
    payment_method json NOT NULL DEFAULT '{}',
    closed_at TIMESTAMP DEFAULT NULL,
    order_number INTEGER,
    cancel_reason_message TEXT,
    costumer_id UUID REFERENCES store_costumer(id) ON DELETE SET NULL,
    costumer json DEFAULT '{}',
    shipping_location JSON,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_order_item(
    id UUID DEFAULT uuid_generate_v4 (),
    order_id UUID REFERENCES store_order(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variant(id) ON DELETE SET NULL,
    price NUMERIC(5, 2) NOT NULL,
    sku TEXT DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_payment_method (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    "name" VARCHAR(200),
    "type" store_payment_method_type DEFAULT 'custom',
    additional_details TEXT DEFAULT '',
    payment_instructions TEXT DEFAULT '',
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_shipping_zone (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE,
    "name" VARCHAR(200),
    "zone" GEOMETRY,
    "path" json DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_shipping_option (
    id UUID DEFAULT uuid_generate_v4 (),
    store_payment_method_id UUID REFERENCES store_payment_method(id) ON DELETE CASCADE NOT NULL,
    shipping_zone_id UUID REFERENCES store_shipping_zone(id) ON DELETE CASCADE NOT NULL,
    "name" VARCHAR(200) DEFAULT '' NOT NULL,
    additional_details TEXT DEFAULT '',
    price NUMERIC(5, 2) DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_pickup_location(
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    "name" VARCHAR(200) DEFAULT '' NOT NULL,
    additional_details TEXT DEFAULT '',
    latitude TEXT DEFAULT '',
    longitude TEXT DEFAULT '',
    location GEOGRAPHY(Point),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_pickup_location_option (
    id UUID DEFAULT uuid_generate_v4 (),
    store_payment_method_id UUID REFERENCES store_payment_method(id) ON DELETE CASCADE NOT NULL,
    store_pickup_location_id UUID REFERENCES store_pickup_location(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_bill (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(5, 2) DEFAULT 0,
    "notes" TEXT DEFAULT '',
    "status" store_bill_status DEFAULT 'pending',
    invoice_number SERIAL,
    "items" json DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_bill_item (
    id UUID DEFAULT uuid_generate_v4 (),
    bill_id UUID REFERENCES store_bill(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(5, 2) DEFAULT 0,
    currency VARCHAR(3) default 'PAB',
    "name" VARCHAR(200) default '',
    description TEXT default '',
    "notes" TEXT default '',
    "type" store_bill_item_type default 'misc',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS authorization_request (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    authorization_type authorization_request_type NOT NULL,
    email VARCHAR(200) NOT NULL,
    code INTEGER,
    expire_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_costumer_cart (
    id UUID DEFAULT uuid_generate_v4 (),
    costumer_id UUID REFERENCES store_costumer(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variant(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_costumer_wishlist (
    id UUID DEFAULT uuid_generate_v4 (),
    costumer_id UUID REFERENCES store_costumer(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variant(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

/*FUNCTIONS*/

CREATE OR REPLACE FUNCTION get_random_number(lower_bound int, higher_bound int) RETURNS INT LANGUAGE PLPGSQL AS $$
DECLARE random_number int;

BEGIN
SELECT floor(random() *(higher_bound - lower_bound + 1)) + lower_bound INTO random_number;

RETURN random_number;

END;

$$
CREATE OR REPLACE FUNCTION validate_authorization_request(
        i_store_id UUID,
        i_authorization_type authorization_request_type,
        i_email VARCHAR,
        i_code INT
    ) RETURNS BOOLEAN LANGUAGE PLPGSQL AS $$
DECLARE is_valid_code int;

DECLARE expire_at_value TIMESTAMP;

BEGIN
SELECT COUNT(*) INTO is_valid_code
FROM authorization_request so
WHERE store_id = i_store_id
    AND authorization_type = i_authorization_type
    AND email = i_email
    AND code = i_code;

IF is_valid_code = 0 THEN RETURN FALSE;

END IF;

SELECT expire_at INTO expire_at_value
FROM authorization_request so
WHERE store_id = i_store_id
    AND authorization_type = i_authorization_type
    AND email = i_email
    AND code = i_code;

delete from authorization_request
WHERE store_id = i_store_id
    AND authorization_type = i_authorization_type
    AND email = i_email;

IF now() > expire_at_value THEN RETURN FALSE;

END IF;

RETURN true;

END;

$$
CREATE OR REPLACE FUNCTION add_product() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE total_of_products INT;

BEGIN
SELECT COUNT(*) INTO total_of_products
FROM product p
WHERE p.store_id = new.store_id;

new.product_number = total_of_products + 1000;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION add_order() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE total_of_orders INT;

BEGIN
SELECT COUNT(*) INTO total_of_orders
FROM store_order so
WHERE so.store_id = new.store_id;

new.order_number = total_of_orders + 1001;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION add_variant() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE total_of_variants INT;

DECLARE random_number INT;

DECLARE exist_number INT;

BEGIN
SELECT COUNT(*) INTO total_of_variants
FROM product_variant pv
WHERE pv.product_id = NEW.product_id;

NEW.position = total_of_variants + 1;

LOOP
SELECT get_random_number(1000, 10000) INTO random_number;

SELECT COUNT(*) INTO exist_number
FROM product_variant pv
WHERE pv.variant_number = random_number
    AND pv.product_id = NEW.product_id;

IF exist_number = 0 THEN NEW.variant_number = random_number;

EXIT;

END IF;

END LOOP;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION add_authorization_request() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE random_number INT;

BEGIN
SELECT get_random_number(100000, 999999) INTO random_number;

delete from authorization_request
WHERE store_id = new.store_id
    AND authorization_type = new.authorization_type
    AND email = new.email;

new.code = random_number;

new.expire_at = current_timestamp + (5 || ' minutes')::interval;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION add_item_to_cart(i_costumer_id UUID, i_variant_id UUID, qty INT) RETURNS setof store_costumer_cart LANGUAGE PLPGSQL AS $$
DECLARE existing_qty int;

DECLARE exist_item int;

DECLARE new_qty int;

DECLARE max_qty int;

BEGIN IF qty <= 0 THEN RAISE NOTICE 'CART_ITEM_ZERO_QTY';

END IF;

SELECT quantity INTO max_qty
FROM product_variant pv
WHERE id = i_variant_id;

IF max_qty > 0 THEN
SELECT quantity INTO existing_qty
FROM store_costumer_cart
WHERE costumer_id = i_costumer_id
    AND variant_id = i_variant_id;

IF existing_qty >= 1 THEN new_qty = qty + existing_qty;

IF new_qty > max_qty THEN new_qty = max_qty;

END IF;

UPDATE store_costumer_cart
SET quantity = new_qty
WHERE costumer_id = i_costumer_id
    AND variant_id = i_variant_id;

ELSE IF qty > max_qty THEN qty = max_qty;

END IF;

INSERT INTO store_costumer_cart (costumer_id, variant_id, quantity)
VALUES(i_costumer_id, i_variant_id, qty);

END IF;

END IF;

RETURN QUERY
SELECT *
FROM store_costumer_cart
WHERE costumer_id = i_costumer_id
    AND variant_id = i_variant_id;

END;

$$
CREATE OR REPLACE FUNCTION remove_item_from_cart(i_costumer_id UUID, i_variant_id UUID, qty INT) RETURNS setof store_costumer_cart LANGUAGE PLPGSQL AS $$
DECLARE existing_qty int;

DECLARE exist_item int;

DECLARE new_qty int;

BEGIN IF qty <= 0 THEN RAISE NOTICE 'CART_ITEM_ZERO_QTY';

END IF;

SELECT quantity INTO existing_qty
FROM store_costumer_cart
WHERE costumer_id = i_costumer_id
    AND variant_id = i_variant_id;

IF existing_qty > 0 THEN new_qty = existing_qty - qty;

IF new_qty > 0 THEN
UPDATE store_costumer_cart
set quantity = new_qty
WHERE costumer_id = i_costumer_id
    AND variant_id = i_variant_id;

ELSE
DELETE FROM store_costumer_cart scci
WHERE costumer_id = i_costumer_id
    AND variant_id = i_variant_id;

END IF;

END IF;

RETURN QUERY
SELECT *
FROM store_costumer_cart
WHERE costumer_id = i_costumer_id
    AND variant_id = i_variant_id;

END;

$$
CREATE OR REPLACE FUNCTION empty_costumer_cart() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE total_of_orders INT;

BEGIN IF NEW.costumer_id IS NOT NULL THEN
DELETE FROM store_costumer_cart
WHERE costumer_id = new.costumer_id;

END IF;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION remove_from_stock() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE new_qty INT;

DECLARE old_qty INT;

BEGIN IF NEW.quantity > 0 THEN
SELECT quantity INTO old_qty
FROM product_variant
WHERE id = NEW.variant_id;

new_qty = old_qty - new.quantity;

UPDATE product_variant
SET quantity = new_qty
WHERE id = new.variant_id;

END IF;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION add_wishlist() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$ BEGIN
DELETE FROM store_costumer_wishlist
WHERE costumer_id = NEW.costumer_id
    AND variant_id = NEW.variant_id;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION add_product_variant_image() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
DECLARE total_of_images INT;

BEGIN
SELECT COUNT(*) INTO total_of_images
FROM product_variant_image pvi
WHERE pvi.product_variant_id = new.product_variant_id;

new.position = total_of_images + 1;

RETURN NEW;

END;

$$
CREATE OR REPLACE FUNCTION add_pickup_location_option() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$ BEGIN
DELETE FROM store_pickup_location_option
WHERE store_payment_method_id = NEW.store_payment_method_id
    AND store_pickup_location_id = NEW.store_pickup_location_id;

RETURN NEW;

END;

$$
/*TRIGGERS*/
CREATE TRIGGER add_product BEFORE
INSERT ON product FOR EACH ROW EXECUTE PROCEDURE add_product();

CREATE TRIGGER add_variant BEFORE
INSERT ON product_variant FOR EACH ROW EXECUTE PROCEDURE add_variant();

CREATE TRIGGER add_order BEFORE
INSERT ON store_order FOR EACH ROW EXECUTE PROCEDURE add_order();

CREATE TRIGGER add_authorization_request BEFORE
INSERT ON authorization_request FOR EACH ROW EXECUTE PROCEDURE add_authorization_request();

CREATE TRIGGER empty_costumer_cart
AFTER
INSERT ON store_order FOR EACH ROW EXECUTE PROCEDURE empty_costumer_cart();

CREATE TRIGGER remove_from_stock BEFORE
INSERT ON store_order_item FOR EACH ROW EXECUTE PROCEDURE remove_from_stock();

CREATE TRIGGER add_wishlist BEFORE
INSERT ON store_costumer_wishlist FOR EACH ROW EXECUTE PROCEDURE add_wishlist();

CREATE TRIGGER add_pickup_location_option BEFORE
INSERT ON store_pickup_location_option FOR EACH ROW EXECUTE PROCEDURE add_pickup_location_option();