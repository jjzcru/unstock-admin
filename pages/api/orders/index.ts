import { GetOrders } from '@domain/interactors/OrdersUseCases';

import { getStoreID } from '@utils/uuid';

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            await getOrders(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getOrders(req, res) {
    const storeId = getStoreID(req);
    if (!storeId) {
        res.status(409).send({ error: 'Invalid store' });
        return;
    }

    try {
        const useCase = new GetOrders({ storeId, status: 'any' });
        const orders = await useCase.execute();
        res.send({ orders });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}
