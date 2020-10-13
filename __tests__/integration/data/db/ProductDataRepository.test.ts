import { closeConnection, runQuery } from '@data/db/db';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { Variant } from '@domain/model/Product';
import {
    ProductRepository,
    UpdateProductParams,
} from '@domain/repository/ProductRepository';

describe.only('ProductDataRepository', () => {
    let productRepository: ProductRepository;
    const storeId: string = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d';
    let productId: string = '0cb28fd0-5fb2-4280-944a-f090541acd24';

    beforeAll(async () => {
        /*const res: any = await runQuery(
            "INSERT INTO store (name) VALUES ('test') RETURNING id;"
        );
        storeId = res.rows[0].id;*/
        productRepository = new ProductDataRepository();
    });

    it.skip('Should create a new product', async () => {
        const params = {
            name: 'Test',
            storeId,
            body: 'New product description',
            vendor: 'apple',
        };

        const product = await productRepository.add(params);

        const { id, name, body, vendor } = product;

        expect(id).not.toBeUndefined();
        productId = id;
        expect(name).toEqual(params.name);
        expect(product.storeId).toEqual(storeId);
        expect(body).toEqual(params.body);
        expect(vendor).toEqual(params.vendor);
    });

    it.skip('Should upload an image', async () => {
        const images = await productRepository.addImages(
            `9b8e7187-b79f-44fa-b44b-09a16fed6c49`,
            [
                {
                    name: 'qr.png',
                    path: '/Users/josejaen/Desktop/qr.png',
                },
                {
                    name: 'qr2.png',
                    path: '/Users/josejaen/Desktop/qr2.png',
                },
            ],
            '7c3ec282-1822-469f-86d6-90ce3ef9e63e'
        );

        expect(images.length).toBeGreaterThan(0);
    }, 60000);

    it.skip('Should upload an product by its id', async () => {
        const variant: Variant = {
            id: 'aa362197-e8c6-4a34-b552-19cfd34e525c',
            productId,
            sku: 'ipad-10.32',
            barcode: '12345678',
            price: 329.99,
            inventoryPolicy: 'allow',
            quantity: 20,
        };
        const params: UpdateProductParams = {
            id: productId,
            name: 'Ipad',
            vendor: 'Apple',
            body: 'This is the new ipad',
            tags: ['apple', 'ipad', 'electronics'],
            variants: [variant],
        };

        const product = await productRepository.update(params);

        expect(product.name).toEqual(params.name);
        expect(product.vendor).toEqual(params.vendor);
        expect(product.body).toEqual(params.body);
        expect(product.tags).toEqual(params.tags);
        for (let i = 0; i < params.variants.length; i++) {
            const productVariant = params.variants[i];
            const responseVariant = product.variants[i];
            expect(productVariant.sku).toEqual(responseVariant.sku);
            expect(productVariant.barcode).toEqual(responseVariant.barcode);
            expect(productVariant.price).toEqual(responseVariant.price);
            expect(productVariant.inventoryPolicy).toEqual(
                responseVariant.inventoryPolicy
            );
            expect(productVariant.quantity).toEqual(responseVariant.quantity);
        }
    }, 60000);

    /*afterAll(async () => {
        if (productId) {
            await runQuery(`DELETE FROM product WHERE id = '${productId}'`);
        }

        if (storeId) {
            await runQuery(`DELETE FROM store WHERE id = '${storeId}'`);
        }

        await closeConnection();
    });*/
});
