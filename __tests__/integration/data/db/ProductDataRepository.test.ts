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

    it.only('Should create a new product', async () => {
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

    afterAll(async () => {
        if(productId) {
            await runQuery(`DELETE FROM product WHERE id = '${productId}'`);
        }

        if(storeId) {
            await runQuery(`DELETE FROM store WHERE id = '${storeId}'`);
        }
        
        
        await closeConnection();
    });
});