import {
    GetPickupLocation,
    UpdatePickupLocation,
    DeletePickupLocation,
    GetPickupLocationOptions,
    AddPickupLocationOption,
    DeletePickupLocationOption,
} from '@domain/interactors/ShippingUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';

export default async (req, res) => {
    const {
        query: { params },
    } = req;

    if (params.length === 1) {
        switch (req.method) {
            case 'GET':
                await proxyRequest(req, res, getPickupLocationById);
                return;
            case 'PUT':
                await proxyRequest(req, res, updatePickupLocation);
                return;
            case 'DELETE':
                await proxyRequest(req, res, deletePickupLocation);
                return;
            default:
                res.status(404).send({ error: 'Not found' });
                return;
        }
    } else if (params.length === 2 && params[1] === 'options') {
        switch (req.method) {
            case 'GET':
                await proxyRequest(req, res, getPickupLocationOptions);
                return;
            case 'POST':
                await proxyRequest(req, res, addPickupLocationOption);
                return;
            case 'DELETE':
                await proxyRequest(req, res, deletePickupLocationOption);
                return;
        }
    }

    res.status(404).send({ error: 'Not found' });
};

async function getPickupLocationById(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const id = params[0];
    if (!isValidUUID(id)) {
        throwError('INVALID_PICKUP_LOCATION');
    }

    const useCase = new GetPickupLocation(id);
    const pickupLocation = await useCase.execute();
    if (!pickupLocation) {
        throwError('NOT_FOUND');
    }

    delete pickupLocation.storeId;

    res.send(pickupLocation);
}

async function updatePickupLocation(req: any, res: any) {
    const storeId = getStoreID(req);

    const {
        query: { params },
    } = req;

    const id = params[0];
    if (!isValidUUID(id)) {
        throwError('INVALID_PICKUP_LOCATION');
    }

    const {
        name,
        additionalDetails,
        latitude,
        longitude,
        isEnabled,
    } = req.body;

    const useCase = new UpdatePickupLocation({
        id,
        storeId,
        name,
        additionalDetails,
        latitude,
        longitude,
        isEnabled,
    });
    const pickupLocation = await useCase.execute();
    if (!pickupLocation) {
        throwError('NOT_FOUND');
    }

    delete pickupLocation.storeId;

    res.send(pickupLocation);
}

async function deletePickupLocation(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const id = params[0];
    if (!isValidUUID(id)) {
        throwError('INVALID_PICKUP_LOCATION');
    }

    const useCase = new DeletePickupLocation(id);
    const pickupLocation = await useCase.execute();
    if (!pickupLocation) {
        throwError('NOT_FOUND');
    }

    delete pickupLocation.storeId;

    res.send(pickupLocation);
}

async function addPickupLocationOption(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const pickupLocationId = params[0];
    if (!isValidUUID(pickupLocationId)) {
        throwError('INVALID_PICKUP_LOCATION');
    }

    const { paymentMethodId } = req.body;

    const useCase = new AddPickupLocationOption({
        pickupLocationId,
        paymentMethodId,
    });
    const option = await useCase.execute();

    res.send(option);
}

async function getPickupLocationOptions(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const pickupLocationId = params[0];
    if (!isValidUUID(pickupLocationId)) {
        throwError('INVALID_PICKUP_LOCATION');
    }

    const useCase = new GetPickupLocationOptions(pickupLocationId);
    const options = await useCase.execute();

    res.send(options);
}

async function deletePickupLocationOption(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const pickupLocationId = params[0];
    if (!isValidUUID(pickupLocationId)) {
        throwError('INVALID_PICKUP_LOCATION');
    }

    const { paymentMethodId } = req.body;
    const useCase = new DeletePickupLocationOption({
        paymentMethodId,
        pickupLocationId,
    });
    const options = await useCase.execute();

    res.send(options);
}
