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

    let status: any = 'any';
    if (!!req.query && !!req.query.status) {
        switch (req.query.status) {
            case 'open':
            case 'closed':
            case 'cancelled':
                status = req.query.status;
                break;
        }
    }

    const useCase = new GetOrders({ storeId, status });
    const orders = await useCase.execute();
    res.send({ orders });
}
