import {
    ArchiveProduct,
    UnarchiveProduct,
    PublishProduct,
    HideProduct,
    SortProducts,
} from '@domain/interactors/ProductsUseCases';

import { isValidUUID, getStoreID } from '@utils/uuid';
import { throwError } from '@errors';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'PUT':
            await proxyRequest(req, res, processPut);
            break;
        case 'POST':
            await proxyRequest(req, res, processPost);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function processPut(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    if (slug.length !== 2) {
        throwError('NOT_FOUND');
    }

    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    switch (slug[1]) {
        case 'archive':
            await archiveProduct(req, res);
            break;
        case 'unarchive':
            await unarchiveProduct(req, res);
            break;
        case 'publish':
            await publishProduct(req, res);
            break;
        case 'hide':
            await hideProduct(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
}

async function processPost(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    if (slug.length !== 1) {
        throwError('NOT_FOUND');
    }

    switch (slug[0]) {
        case 'sorting':
            await sorting(req, res);
            break;

        default:
            res.status(404).send({ error: 'Not found' });
    }
}

async function archiveProduct(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const productId = slug[0];
    const storeId = getStoreID(req);

    if (!isValidUUID(productId)) {
        throwError('INVALID_PRODUCT');
    }

    const useCase = new ArchiveProduct(productId, storeId);
    const product = await useCase.execute();
    res.send({ product });
}

async function unarchiveProduct(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const productId = slug[0];
    const storeId = getStoreID(req);

    if (!isValidUUID(productId)) {
        throwError('INVALID_PRODUCT');
    }

    const useCase = new UnarchiveProduct(productId, storeId);
    const product = await useCase.execute();
    res.send({ product });
}

async function publishProduct(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const productId = slug[0];
    const storeId = getStoreID(req);

    if (!isValidUUID(productId)) {
        throwError('INVALID_PRODUCT');
    }

    const useCase = new PublishProduct(productId, storeId);
    const product = await useCase.execute();
    res.send({ product });
}

async function hideProduct(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const productId = slug[0];
    const storeId = getStoreID(req);

    if (!isValidUUID(productId)) {
        throwError('INVALID_PRODUCT');
    }

    const useCase = new HideProduct(productId, storeId);
    const product = await useCase.execute();
    res.send({ product });
}

async function sorting(req: any, res: any) {
    const storeId = getStoreID(req);
    const { products } = req.body;
    const useCase = new SortProducts(products, storeId);
    const product = await useCase.execute();
    res.send(product);
}
