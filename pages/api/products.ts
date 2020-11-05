import { GetProducts, AddProduct } from '@domain/interactors/ProductsUseCases';

import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getProducts);
            break;
        case 'POST':
            await proxyRequest(req, res, addProduct);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getProducts(req: any, res: any) {
    const storeId = getStoreID(req);

    const useCase = new GetProducts(storeId);
    const products = await useCase.execute();
    res.send({ products });
}

async function addProduct(req: any, res: any) {
    const storeId = getStoreID(req);

    const {
        name,
        category,
        price,
        quantity,
        sku,
        barcode,
        vendor,
        inventoryPolicy,
        tags,
    } = req.body;

    const useCase = new AddProduct({
        storeId: storeId || '',
        title: name || '',
        body: '',
        tags: !!tags ? tags : [],
        category: category || '',
        price: price || 0,
        quantity: quantity || 0,
        sku: sku || '',
        barcode: barcode || '',
        vendor: vendor || '',
        inventoryPolicy: inventoryPolicy || 'block',
    });
    const product = await useCase.execute();
    res.send({ product });
}
