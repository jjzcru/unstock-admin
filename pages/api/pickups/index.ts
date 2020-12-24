import {
    GetPickupLocations,
    AddPickupLocation,
} from '@domain/interactors/ShippingUseCases';

import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getPickupLocations);
            break;
        case 'POST':
            await proxyRequest(req, res, addPickupLocation);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getPickupLocations(req: any, res: any) {
    const storeId = getStoreID(req);

    const useCase = new GetPickupLocations(storeId);
    const pickupLocations = await useCase.execute();
    res.send(pickupLocations);
}

async function addPickupLocation(req: any, res: any) {
    const storeId = getStoreID(req);

    const { name, additionalDetails, latitude, longitude } = req.body;

    const useCase = new AddPickupLocation({
        storeId,
        name,
        additionalDetails,
        latitude,
        longitude,
        isEnabled: true,
    });
    const pickupLocation = await useCase.execute();
    res.send(pickupLocation);
}
