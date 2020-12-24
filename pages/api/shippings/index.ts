import {
    GetShippingZones,
    AddShippingZone,
} from '@domain/interactors/ShippingUseCases';

import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getShippingZones);
            break;
        case 'POST':
            await proxyRequest(req, res, addShippingZone);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getShippingZones(req: any, res: any) {
    const storeId = getStoreID(req);

    const useCase = new GetShippingZones(storeId);
    const shippingZones = await useCase.execute();
    res.send(shippingZones);
}

async function addShippingZone(req: any, res: any) {
    const storeId = getStoreID(req);

    const { name, path } = req.body;

    const useCase = new AddShippingZone({
        storeId,
        name,
        path,
        isEnabled: true,
    });
    const shippingZone = await useCase.execute();
    res.send(shippingZone);
}
