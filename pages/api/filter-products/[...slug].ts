import {
    GetProductsQuantity,
    GetProductsByPagination,
} from '@domain/interactors/ProductsUseCases';

import { isValidUUID, getStoreID } from '@utils/uuid';
import { throwError } from '@errors';
import { proxyRequest } from '@utils/request';
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, processGet);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function processGet(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    switch (slug[0]) {
        case 'list':
            await productsQuantity(req, res);
            break;
        case 'pagination':
            await productsByPagination(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
}

async function productsQuantity(req: any, res: any) {
    const storeId = getStoreID(req);
    const useCase = new GetProductsQuantity(storeId);
    const quantity = await useCase.execute();
    res.send({ quantity });
}

async function productsByPagination(req: any, res: any) {
    const {
        query: { slug, offset, limit },
    } = req;
    const storeId = getStoreID(req);
    if (!offset || !limit) {
        throwError('MISSING_ARGUMENTS');
    }
    const useCase = new GetProductsByPagination(storeId, offset, limit);
    const products = await useCase.execute();
    res.send({ products });
}
