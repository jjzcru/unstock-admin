INSERT INTO store ("id", "name")
values (
        'f2cf6dde-f6aa-44c5-837d-892c7438ed3d',
        'Unstock'
    );

insert into store_order (
        store_id,
        "address",
        sub_total,
        total,
        email,
        phone,
        items
    )
values (
        'f2cf6dde-f6aa-44c5-837d-892c7438ed3d',
        '{"id":"f2cf6dde-f6aa-44c5-837d-892c7438ed3d","first_name":"John","last_name":"Doe","address":"42 Wallaby Way, Sydney","address_optional":"","postal_code":"123745","location":{"latitude":8.9673,"longitude":-79.5339}}',
        20.00,
        20.00,
        'jdoe@unstock.shop',
        '222-2222',
        '{"id":"f2cf6dde-f6aa-44c5-837d-892c7438ed5d","variant_id":"f2cf6dde-f6aa-44c5-837d-892c7438ed6d","product_id":"f2cf6dde-f6aa-44c5-837d-892c7438ed7d","product":{"price":1},"quantity":20}'
    );