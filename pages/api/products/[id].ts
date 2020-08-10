import {
    GetProductByID,
    DeleteProduct,
} from '@domain/interactors/ProductsUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            await getProduct(req, res);
            break;
        case 'DELETE':
            await deleteProduct(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getProduct(req, res) {
    const {
        query: { id },
    } = req;

    const storeId = getStoreID(req);
    if (!storeId) {
        res.send({ error: 'Invalid store' });
        return;
    }

    try {
        if (!isValidUUID(id)) {
            res.status(400).send({ error: 'Invalid id' });
            return;
        }

        const useCase = new GetProductByID(id, storeId);
        const product = await useCase.execute();
        if (!!product) {
            res.send({ product });
            return;
        }
        res.status(404).send({ error: 'Product not found' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

async function deleteProduct(req, res) {
    const {
        query: { id },
    } = req;

    const storeId = getStoreID(req);
    if (!storeId) {
        res.send({ error: 'Invalid store' });
        return;
    }

    try {
        if (!isValidUUID(id)) {
            res.status(400).send({ error: 'Invalid id' });
            return;
        }

        const useCase = new DeleteProduct(id);
        const product = await useCase.execute();
        if (!!product) {
            res.send({ product });
            return;
        }
        res.status(404).send({ error: 'Product not found' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}
