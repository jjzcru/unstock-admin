import { closeConnection, runQuery } from '@data/db/db';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { ProductRepository } from '@domain/repository/ProductRepository';

describe.only('ProductDataRepository', () => {
    let productRepository: ProductRepository;
    let storeId: string;
    let productId: string;
    beforeAll(async () => {
        const res: any = await runQuery(
            "INSERT INTO store (name) VALUES ('test') RETURNING id;"
        );
        storeId = res.rows[0].id;
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

    it('Should upload an image', async () => {
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

    afterAll(async () => {
        if (productId) {
            await runQuery(`DELETE FROM product WHERE id = '${productId}'`);
        }

        if (storeId) {
            await runQuery(`DELETE FROM store WHERE id = '${storeId}'`);
        }

        await closeConnection();
    });
});
