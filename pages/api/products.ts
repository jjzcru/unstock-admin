import { GetProducts, AddProduct } from '@domain/interactors/ProductsUseCases';

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
    try {
        const useCase = new GetProducts();
        const products = await useCase.execute();
        res.send({ products });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

async function addProduct(req, res) {
    try {
        const {
            storeId,
            name,
            category,
            price,
            quantity,
            sku,
            barcode,
            vendor,
            inventoryPolicy,
        } = req.body;

        const useCase = new AddProduct({
            storeId: storeId || '',
            name: name || '',
            body: '',
            tags: [],
            category: category || '',
            price: price || 0,
            quantity: quantity || 0,
            sku: sku || '',
            barcode: barcode || '',
            vendor: vendor || '',
            inventoryPolicy: inventoryPolicy || 'allow',
        });
        const product = await useCase.execute();

        res.send({ product });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}
