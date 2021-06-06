CREATE TYPE store_draft_order_status AS enum('open', 'archived', 'cancelled', 'paid');

CREATE TABLE IF NOT EXISTS store_draft_order (
    id UUID DEFAULT uuid_generate_v4 (),
    store_id UUID REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    address json DEFAULT '{}',
    subtotal NUMERIC(17, 2) DEFAULT 0,
    tax NUMERIC(5, 2) DEFAULT 0,
    total NUMERIC(17, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'PAB',
    shipping_type store_order_shipping_type DEFAULT 'pickup',
    status store_draft_order_status DEFAULT 'open',
    message VARCHAR(240),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    cancelled_at TIMESTAMP DEFAULT NULL,
    pickup_location json DEFAULT '{}',
    shipping_option json DEFAULT '{}',
    payment_method json DEFAULT '{}',
    costumer_id UUID REFERENCES store_costumer(id) ON DELETE SET NULL,
    costumer json DEFAULT '{}',
    shipping_location JSON,
    cancel_reason_message TEXT,
    created_by INTEGER,
    order_id UUID DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS store_draft_order_item(
    id UUID DEFAULT uuid_generate_v4 (),
    draft_order_id UUID REFERENCES store_draft_order(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variant(id) ON DELETE SET NULL,
    price NUMERIC(5, 2) NOT NULL,
    sku TEXT DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
);

ALTER TABLE public.store_draft_order ALTER COLUMN payment_method DROP NOT NULL;

ALTER TABLE public.store_draft_order ADD COLUMN draft_number INTEGER;


CREATE OR REPLACE FUNCTION add_draft() RETURNS TRIGGER LANGUAGE PLPGSQL as
$$
DECLARE total_of_drafts INT;
BEGIN
SELECT COUNT(*) INTO total_of_drafts
FROM store_draft_order so
WHERE so.store_id = new.store_id;

NEW.draft_number = total_of_drafts + 1001;

RETURN NEW;

END;
$$

CREATE TRIGGER add_draft BEFORE
INSERT ON store_draft_order FOR EACH ROW EXECUTE PROCEDURE add_draft();