import { runQuery } from '@data/db/db';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { Variant } from '@domain/model/Product';
import {
    ProductRepository,
    AddParams,
    UpdateProductParams,
    AddVariantParams,
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
            storeId,
            title: 'Concept C222',
            body: 'fishing reel',
            vendor: '13 Fishing',
            tags: ['reel'],
            option_1: 'Mano',
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

    it.skip('Should update a product ', async () => {
        const params: UpdateProductParams = {
            id: productId,
            title: 'Concept C3',
            body: 'fishing reel',
            vendor: '13 Fishing',
            tags: ['reel'],
            option_1: 'Mano',
            option_2: 'Velocidad',
        };

        const product = await productRepository.update(params);
        const { id, title, body, vendor } = product;

        expect(id).not.toBeUndefined();
        productId = id;
        expect(product.storeId).toEqual(storeId);
        expect(params.title).toEqual(title);
        expect(body).toEqual(params.body);
        expect(vendor).toEqual(params.vendor);
    });

    it('Should add a product variant ', async () => {
        const params: AddVariantParams = {
            productId,
            sku: '',
            price: 10.99,
            quantity: 10,
            option_1: 'Derecha',
            option_2: '8.1.1',
            option_3: null,
            inventoryPolicy: 'allow',
        };

        const variant = await productRepository.addVariant(productId, params);
        expect(variant.length).toBeGreaterThan(0);
    });

    // afterAll(async () => {
    //     if (productId) {
    //         await runQuery(`DELETE FROM product WHERE id = $1`, [productId]);
    //     }
    // });
});
