import { AddVariantImage } from '@domain/interactors/ProductsUseCases';

import { isValidUUID, getStoreID } from '@utils/uuid';
import { throwError } from '@errors';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, addProductVariantsImages);
            break;
        case 'PUT':
            await proxyRequest(req, res, updateProductVariantsImages);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function addProductVariantsImages(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { variantImages } = req.body;
    const useCase = new AddVariantImage(variantImages);
    const data = await useCase.execute();
    res.send({ data });
}

async function updateProductVariantsImages(req: any, res: any) {
    res.send(true);
}
