CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE inventory_policy_type AS enum('block', 'allow');

CREATE TABLE IF NOT EXISTS store  (
    id UUID DEFAULT uuid_generate_v4 (),
    "name" VARCHAR(200) DEFAULT '' NOT NULL,
    legal_bussiness_name VARCHAR(200) DEFAULT '' NOT NULL,
    address TEXT DEFAULT '',
    timezone VARCHAR(20) DEFAULT 'UTC−05:00',
    currency VARCHAR(3) DEFAULT 'PAB',
    weight_unit VARCHAR(3) DEFAULT 'kg',
    domain VARCHAR(200) DEFAULT '',
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

CREATE TABLE IF NOT EXISTS product (
    id uuid DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id),
    "name" VARCHAR(150) DEFAULT '', /* Name of the product */
    "body" TEXT DEFAULT '', /* Description of the product */
    vendor VARCHAR(200) DEFAULT '',
    category VARCHAR(100),
    tags TEXT [],
    is_publish BOOLEAN DEFAULT false,
    is_archive BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    publish_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

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
    sku TEXT DEFAULT '',
    barcode TEXT DEFAULT '',
    price NUMERIC(5,2),
    currency VARCHAR(3) default 'PAB',
    inventory_policy inventory_policy_type default 'block',
    quantity INTEGER default 0,
    images text [],
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_option (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    position integer default 1,
    name VARCHAR(100) default 'default',
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_variant_option (
    id uuid DEFAULT uuid_generate_v4 (),
    product_id UUID REFERENCES product(id),
    product_variant_id UUID REFERENCES product_variant(id),
    name VARCHAR(100) default 'default',
    PRIMARY KEY (id)
);