import { ValidSlug } from '@domain/interactors/ProductsUseCases';
import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, validSlug);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function validSlug(req: any, res: any) {
    const {
        body: { slug },
    } = req;
    const storeId = getStoreID(req);
    const useCase = new ValidSlug(storeId, slug);
    const result = await useCase.execute();
    res.send(result);
}
