import {
    GetOrder,
    CloseOrder,
    CancelOrder,
    DeleteOrder,
} from '@domain/interactors/OrdersUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getOrderByID);
            break;
        case 'POST':
            await proxyRequest(req, res, processPost);
            break;
        case 'DELETE':
            await proxyRequest(req, res, deleteOrder);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getOrderByID(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    if (slug.length !== 1) {
        throwError('NOT_FOUND');
    }

    const orderId = slug[0];
    if (!isValidUUID(orderId)) {
        throwError('INVALID_ORDER');
    }

    const storeId = getStoreID(req);

    const useCase = new GetOrder({ storeId, orderId });
    const order = await useCase.execute();
    res.send({ order });
}

async function processPost(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    if (slug.length !== 2) {
        throwError('NOT_FOUND');
    }

    const orderId = slug[0];
    if (!isValidUUID(orderId)) {
        throwError('INVALID_ORDER');
    }

    switch (slug[1]) {
        case 'close':
            closeOrder(req, res);
            break;
        case 'cancel':
            cancelOrder(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
}

async function closeOrder(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const orderId = slug[0];
    const storeId = getStoreID(req);
    const useCase = new CloseOrder({ storeId, orderId });
    const order = await useCase.execute();
    res.send({ order });
}

async function cancelOrder(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    const orderId = slug[0];
    const storeId = getStoreID(req);
    const useCase = new CancelOrder({ storeId, orderId });
    const order = await useCase.execute();
    res.send({ order });
}

async function deleteOrder(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    if (slug.length !== 1) {
        throwError('NOT_FOUND');
    }

    const orderId = slug[0];
    if (!isValidUUID(orderId)) {
        throwError('INVALID_ORDER');
    }

    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }
    const useCase = new DeleteOrder({ storeId, orderId });
    const order = await useCase.execute();
    res.send({ order });
}
