import {
    AddProductVariants,
    UpdateProductVariants,
    RemoveProductVariant,
} from '@domain/interactors/ProductsUseCases';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, addProductVariants);
            break;
        case 'PUT':
            await proxyRequest(req, res, updateProductVariants);
            break;
        case 'DELETE':
            await proxyRequest(req, res, removeProductVariants);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function addProductVariants(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { variant } = req.body;
    variant.taxable = variant.options.taxable;
    variant.tax = variant.taxable ? Number(variant.options.tax) : null;
    const useCase = new AddProductVariants(id, variant);
    const data = await useCase.execute();
    res.send({ data });
}

async function updateProductVariants(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { variant } = req.body;
    variant.taxable = variant.options.taxable;
    variant.tax = variant.taxable ? Number(variant.options.tax) : null;
    const useCase = new UpdateProductVariants(id, variant);
    const data = await useCase.execute();
    res.send({ data });
}

async function removeProductVariants(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { variants } = req.body;
    const useCase = new RemoveProductVariant(id);
    const data = await useCase.execute();
    res.send({ data });
}
