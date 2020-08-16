import { GetTags } from '@domain/interactors/ProductsUseCases';
import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getTags);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getTags(req: any, res: any) {
    const storeId = getStoreID(req);
    const useCase = new GetTags(storeId);
    const tags = await useCase.execute();
    res.send({ tags });
}
