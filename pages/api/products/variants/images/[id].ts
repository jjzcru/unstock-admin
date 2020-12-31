import {
    AddVariantImage,
    RemoveVariantImage,
} from '@domain/interactors/ProductsUseCases';

import { isValidUUID, getStoreID } from '@utils/uuid';
import { throwError } from '@errors';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, addProductVariantsImages);
            break;

        case 'DELETE':
            await proxyRequest(req, res, deleteProductVariantsImages);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function addProductVariantsImages(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { variantImage } = req.body;
    const useCase = new AddVariantImage({
        productVariantId: id,
        productImageId: variantImage.productImageId,
        position: variantImage.position,
    });
    const data = await useCase.execute();
    res.send({ data });
}

async function deleteProductVariantsImages(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { productImageId } = req.body;
    console.log(req.body);
    const useCase = new RemoveVariantImage(id, productImageId);
    const data = await useCase.execute();
    res.send({ data });
}
