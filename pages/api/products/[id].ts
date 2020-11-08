import {
    GetProductByID,
    DeleteProduct,
    UpdateProduct,
} from '@domain/interactors/ProductsUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';
import { throwError } from '@errors';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getProduct);
            break;
        case 'PUT':
            await proxyRequest(req, res, updateProduct);
            break;
        case 'DELETE':
            await proxyRequest(req, res, deleteProduct);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getProduct(req: any, res: any) {
    const {
        query: { id },
    } = req;

    const storeId = getStoreID(req);

    if (!isValidUUID(id)) {
        throwError('INVALID_PRODUCT');
        return;
    }

    const useCase = new GetProductByID(id, storeId);
    const product = await useCase.execute();
    res.send({ product });
}

async function updateProduct(req: any, res: any) {
    const {
        query: { id },
    } = req;

    const { name, vendor, body, variants, tags } = req.body;

    const storeId = getStoreID(req);

    if (!isValidUUID(id)) {
        throwError('INVALID_PRODUCT');
    }

    const useCase = new UpdateProduct({
        id,
        storeId,
        title: name,
        body,
        tags,
        vendor,
        variants,
    });
    const product = await useCase.execute();
    res.send({ product });
}

async function deleteProduct(req: any, res: any) {
    const {
        query: { id },
    } = req;

    const storeId = getStoreID(req);

    if (!isValidUUID(id)) {
        throwError('INVALID_PRODUCT');
    }

    const useCase = new DeleteProduct(id, storeId);
    const product = await useCase.execute();
    res.send({ product });
}
