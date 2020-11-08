import {
    AddProductVariants,
    UpdateProductVariants,
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
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function addProductVariants(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { variants } = req.body;
    const useCase = new AddProductVariants(id, variants);
    const data = await useCase.execute();
    res.send({ data });
}

async function updateProductVariants(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { variants } = req.body;
    const useCase = new UpdateProductVariants(id, variants);
    const data = await useCase.execute();
    res.send({ data });
}
