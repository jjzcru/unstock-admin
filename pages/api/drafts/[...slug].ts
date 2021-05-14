import {
    ArchiveDraft,
    DraftToOrder,
    CancelDraft,
    UpdateDraft,
} from '@domain/interactors/DraftUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getDraftByID);
            break;
        case 'PUT':
            await proxyRequest(req, res, processPut);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getDraftByID(req: any, res: any) {
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

async function processPut(req: any, res: any) {
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
            await closeOrder(req, res);
            break;
        case 'cancel':
            await cancelOrder(req, res);
            break;
        case 'paid':
            await MarkAsPaid(req, res);
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
    if (!storeId) {
        throwError('INVALID_STORE');
    }

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

async function MarkAsPaid(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    const orderId = slug[0];
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    const useCase = new PaidOrder({ storeId, orderId });
    const data = await useCase.execute();
    res.send({ data });
}
