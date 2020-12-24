import { runQuery } from '@data/db/db';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { Variant } from '@domain/model/Product';
import {
    ProductRepository,
    UpdateProductParams,
    AddVariantParams,
    AddVariantImageParams,
    AddParams,
} from '@domain/repository/ProductRepository';

describe.only('ProductDataRepository', () => {
    let productRepository: ProductRepository;
    const storeId: string = process.env.TEST_STORE_ID;
    let productId: string;

    beforeAll(async () => {
        productRepository = new ProductDataRepository();
    });

    it('Should create a new product', async () => {
        const params: AddParams = {
            title: 'TESTING IMAGES TO CDN',
            storeId,
            body: 'New product description',
            vendor: 'apple',
        };

        const product = await productRepository.add(params);
        const { id, title, body, vendor } = product;

        expect(id).not.toBeUndefined();
        productId = id;
        expect(product.storeId).toEqual(storeId);
        expect(params.title).toEqual(title);
        expect(body).toEqual(params.body);
        expect(vendor).toEqual(params.vendor);
    });

    afterAll(async () => {
        if (productId) {
            await runQuery(`DELETE FROM product WHERE id = $1`, [productId]);
        }
    });
});
