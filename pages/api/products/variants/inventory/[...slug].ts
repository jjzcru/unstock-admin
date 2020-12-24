import {
    AddVariantInventory,
    RemoveVariantInventory,
} from '@domain/interactors/ProductsUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, processPost);
            break;

        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function processPost(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    console.log(slug);
    if (slug.length !== 3) {
        throwError('NOT_FOUND');
    }

    const orderId = slug[0];
    if (!isValidUUID(orderId)) {
        throwError('INVALID_ORDER');
    }

    switch (slug[1]) {
        case 'add':
            await addInventory(req, res);
            break;
        case 'remove':
            await removeInventory(req, res);
            break;

        default:
            res.status(404).send({ error: 'Not found' });
    }
}

async function addInventory(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const variantId = slug[0];
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }
    const qty = Number(slug[2]);
    console.log(variantId);
    console.log(qty);

    const useCase = new AddVariantInventory(variantId, qty);
    const result = await useCase.execute();
    res.send({ result });
}

async function removeInventory(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const variantId = slug[0];
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }
    const qty = Number(slug[2]);

    const useCase = new RemoveVariantInventory(variantId, qty);
    const result = await useCase.execute();
    res.send({ result });
}
