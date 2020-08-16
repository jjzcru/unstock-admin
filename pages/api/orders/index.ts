import { GetOrders } from '@domain/interactors/OrdersUseCases';

import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getOrders);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getOrders(req: any, res: any) {
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    const useCase = new GetOrders({ storeId, status: 'any' });
    const orders = await useCase.execute();
    res.send({ orders });
}
