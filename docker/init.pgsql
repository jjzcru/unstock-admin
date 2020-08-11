CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE inventory_policy_type AS enum('block', 'allow');

CREATE TYPE product_variant_type AS enum('default', 'variant');

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
    images text [] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    "options" uuid [] DEFAULT '{}',
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_option (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    position integer default 0,
    name VARCHAR(100) default 'default',
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_option_value(
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    position integer default 0,
    name VARCHAR(100) NOT NULL,
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

/*DEFAULT DATA*/
INSERT INTO store ("id", "name")
values (
        'f2cf6dde-f6aa-44c5-837d-892c7438ed3d',
        'Unstock'
    );