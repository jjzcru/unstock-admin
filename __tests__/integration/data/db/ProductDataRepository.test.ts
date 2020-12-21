import { runQuery } from '@data/db/db';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { Variant } from '@domain/model/Product';
import {
    ProductRepository,
    UpdateProductParams,
    AddVariantParams,
    AddVariantImageParams,
} from '@domain/repository/ProductRepository';

describe.only('ProductDataRepository', () => {
    let productRepository: ProductRepository;
    // const storeId: string = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d';
    // let productId: string = '3a37bf64-0379-4955-8aaa-cfbeaaea14fb';

    beforeAll(async () => {
        /*const res: any = await runQuery(
            "INSERT INTO store (name) VALUES ('test') RETURNING id;"
        );
        storeId = res.rows[0].id;*/
        productRepository = new ProductDataRepository();
    });

    it('Should create a new product', async () => {
        const storeId = process.env.TEST_STORE_ID;

        const params = {
            name: 'TESTING IMAGES TO CDN',
            storeId,
            body: 'New product description',
            vendor: 'apple',
            price: 999,
        };

        const product = await productRepository.add(params);

        const { id, title, body, vendor } = product;

        expect(id).not.toBeUndefined();
        const productId = id;
        expect(product.storeId).toEqual(storeId);
        expect(body).toEqual(params.body);
        expect(vendor).toEqual(params.vendor);
    });

    it.skip('Should upload an image', async () => {
        const filePath = process.env.TEST_UPLOAD_FILE_PATH;
        const key = process.env.TEST_UPLOAD_FILE_KEY;
        const storeId = process.env.TEST_STORE_ID;
        const productId = process.env.TEST_PRODUCT_ID;
        const images = await productRepository.addImages(
            productId,
            [
                {
                    name: key,
                    path: filePath,
                },
            ],
            storeId
        );

        expect(images.length).toBeGreaterThan(0);
    }, 60000);

    /*it.skip('Should upload an product by its id', async () => {
        const params: UpdateProductParams = {
            id: productId,
            vendor: 'Apple',
            body: 'This is the new ipad',
            tags: ['apple', 'ipad', 'electronics'],
        };

        const product = await productRepository.update(params);

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
    }, 60000);*/

    it.skip('add product variants', async () => {
        const params: AddVariantParams[] = [
            {
                productId: 'd6717d7b-2102-4bd8-8887-38d6397147f8',
                sku: '123123',
                barcode: '5544332211',
                price: 2,
                quantity: 10,
                inventoryPolicy: 'block',
                option_1: 'size',
                option_2: '',
                option_3: '',
            },
        ];
        const variants = await productRepository.addVariant(productId, params);
        expect(variants.length).toBeGreaterThan(0);
    }, 60000);

    it.skip('add product variant image', async () => {
        const params: AddVariantImageParams[] = [
            {
                productVariantId: '92bbf95f-3b9e-43ba-81fa-dbcb2651159d',
                productImageId: '1f65a8b6-16e3-423e-a87c-35c3e1e25f73',
            },
        ];
        const variantImage = await productRepository.addVariantImage(params);
        expect(variantImage.length).toBeGreaterThan(0);
    }, 60000);

    it.skip('update product variants', async () => {
        const params: AddVariantParams[] = [
            {
                productId: '51bcca4a-ded9-4b8f-9962-0613bf63bbc6',
                sku: '123123',
                barcode: '5544332211',
                price: 28,
                quantity: 10,
                inventoryPolicy: 'block',
                option_1: 'size',
                option_2: '',
                option_3: '',
            },
        ];
        const variants = await productRepository.updateVariant(
            productId,
            params
        );
        expect(variants.length).toBeGreaterThan(0);
    }, 60000);

    it.skip('update product variant image', async () => {
        const params: AddVariantImageParams[] = [
            {
                productVariantId: '92bbf95f-3b9e-43ba-81fa-dbcb2651159d',
                productImageId: '1f65a8b6-16e3-423e-a87c-35c3e1e25f73',
            },
        ];
        const variantImage = await productRepository.updateVariantImage(params);
        expect(variantImage.length).toBeGreaterThan(0);
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
