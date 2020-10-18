import { GetBills } from '@domain/interactors/BillUseCases';

import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getBills);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getBills(req: any, res: any) {
    const storeId = getStoreID(req);

    const useCase = new GetBills(storeId);
    const bills = await useCase.execute();
    res.send({ bills });
}
