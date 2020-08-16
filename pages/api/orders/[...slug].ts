import {
    GetOrder,
    CloseOrder,
    CancelOrder,
    DeleteOrder,
} from '@domain/interactors/OrdersUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';

export default async (req, res) => {
    switch (req.method) {
        case 'GET':
            await getOrderByID(req, res);
            break;
        case 'POST':
            await processPost(req, res);
            break;
        case 'DELETE':
            await deleteOrder(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getOrderByID(req, res) {
    const {
        query: { slug },
    } = req;
    if (slug.length !== 1) {
        res.status(404).send({ error: 'Not found' });
        return;
    }

    const orderId = slug[0];
    if (!isValidUUID(orderId)) {
        res.status(409).send({ error: 'Invalid order id' });
        return;
    }

    const storeId = getStoreID(req);
    if (!storeId) {
        res.status(409).send({ error: 'Invalid store' });
        return;
    }

    try {
        const useCase = new GetOrder({ storeId, orderId });
        const order = await useCase.execute();
        if (!!order) {
            res.send({ order });
            return;
        }
        res.status(404).send({ error: 'Not found' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

async function processPost(req, res) {
    const {
        query: { slug },
    } = req;
    if (slug.length !== 2) {
        res.status(404).send({ error: 'Not found' });
        return;
    }

    const orderId = slug[0];
    if (!isValidUUID(orderId)) {
        res.status(409).send({ error: 'Invalid order id' });
        return;
    }

    const storeId = getStoreID(req);
    if (!storeId) {
        res.status(409).send({ error: 'Invalid store' });
        return;
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

async function closeOrder(req, res) {
    const {
        query: { slug },
    } = req;
    const orderId = slug[0];
    const storeId = getStoreID(req);
    try {
        const useCase = new CloseOrder({ storeId, orderId });
        const order = await useCase.execute();
        if (!!order) {
            res.send({ order });
            return;
        }
        res.status(404).send({ error: 'Not found' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

async function cancelOrder(req, res) {
    const {
        query: { slug },
    } = req;
    const orderId = slug[0];
    const storeId = getStoreID(req);
    try {
        const useCase = new CancelOrder({ storeId, orderId });
        const order = await useCase.execute();
        if (!!order) {
            res.send({ order });
            return;
        }
        res.status(404).send({ error: 'Not found' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

async function deleteOrder(req, res) {
    const {
        query: { slug },
    } = req;
    if (slug.length !== 1) {
        res.status(404).send({ error: 'Not found' });
        return;
    }

    const orderId = slug[0];
    if (!isValidUUID(orderId)) {
        res.status(409).send({ error: 'Invalid order id' });
        return;
    }

    const storeId = getStoreID(req);
    if (!storeId) {
        res.status(409).send({ error: 'Invalid store' });
        return;
    }
    try {
        const useCase = new DeleteOrder({ storeId, orderId });
        const order = await useCase.execute();
        if (!!order) {
            res.send({ order });
            return;
        }
        res.status(404).send({ error: 'Not found' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}
