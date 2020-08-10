import { GetProducts, AddProduct } from '@domain/interactors/ProductsUseCases';

import { getStoreID } from '@utils/uuid';

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            await getProducts(req, res);
            break;
        case 'POST':
            await addProduct(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getProducts(req, res) {
    const storeId = getStoreID(req);
    if (!storeId) {
        res.send({ error: 'Invalid store' });
        return;
    }

    try {
        const useCase = new GetProducts(storeId);
        const products = await useCase.execute();
        res.send({ products });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

async function addProduct(req, res) {
    const storeId = getStoreID(req);
    if (!storeId) {
        res.send({ error: 'Invalid store' });
        return;
    }

    try {
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
            name: name || '',
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
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}
