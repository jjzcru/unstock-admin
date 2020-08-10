import { GetTags } from '@domain/interactors/ProductsUseCases';
import { getStoreID } from '@utils/uuid';

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            await getTags(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getTags(req, res) {
    const storeId = getStoreID(req);
    if (!storeId) {
        res.send({ error: 'Invalid store' });
        return;
    }

    try {
        const useCase = new GetTags(storeId);
        const products = await useCase.execute();
        res.send({ products });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}
