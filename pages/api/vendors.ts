import { GetVendors } from '@domain/interactors/ProductsUseCases';
import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getVendors);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getVendors(req: any, res: any) {
    const storeId = getStoreID(req);
    const useCase = new GetVendors(storeId);
    const vendors = await useCase.execute();
    res.send({ vendors });
}
