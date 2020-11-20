import {
    GetShippingZone,
    UpdateShippingZone,
    DeleteShippingZone,
    GetShippingOptions,
    AddShippingOption,
    UpdateShippingOption,
    DeleteShippingOption,
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
                await proxyRequest(req, res, getShippingZoneById);
                return;
            case 'PUT':
                await proxyRequest(req, res, updateShippingZone);
                return;
            case 'DELETE':
                await proxyRequest(req, res, deleteShippingZone);
                return;
        }
    } else if (params.length === 2 && params[1] === 'options') {
        switch (req.method) {
            case 'GET':
                await proxyRequest(req, res, getShippingOptions);
                return;
            case 'POST':
                await proxyRequest(req, res, addShippingOption);
                return;
        }
    } else if (params.length === 3 && params[1] === 'options') {
        switch (req.method) {
            case 'PUT':
                await proxyRequest(req, res, updateShippingOption);
                return;
            case 'DELETE':
                await proxyRequest(req, res, deleteShippingOption);
                return;
        }
    }

    res.status(404).send({ error: 'Not found' });
};

async function getShippingZoneById(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const id = params[0];
    if (!isValidUUID(id)) {
        throwError('INVALID_SHIPPING_ZONE');
    }

    const useCase = new GetShippingZone(id);
    const shippingZone = await useCase.execute();
    if (!shippingZone) {
        throwError('NOT_FOUND');
    }

    delete shippingZone.storeId;

    res.send(shippingZone);
}

async function updateShippingZone(req: any, res: any) {
    const storeId = getStoreID(req);

    const {
        query: { params },
    } = req;

    const id = params[0];
    if (!isValidUUID(id)) {
        throwError('INVALID_SHIPPING_ZONE');
    }

    const { name, path, isEnabled } = req.body;

    const useCase = new UpdateShippingZone({
        id,
        storeId,
        name,
        path,
        isEnabled,
    });
    const shippingZone = await useCase.execute();
    if (!shippingZone) {
        throwError('NOT_FOUND');
    }

    delete shippingZone.storeId;

    res.send(shippingZone);
}

async function deleteShippingZone(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const id = params[0];
    if (!isValidUUID(id)) {
        throwError('INVALID_SHIPPING_ZONE');
    }

    const useCase = new DeleteShippingZone(id);
    const shippingZone = await useCase.execute();
    if (!shippingZone) {
        throwError('NOT_FOUND');
    }

    delete shippingZone.storeId;

    res.send(shippingZone);
}

async function addShippingOption(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const shippingZoneId = params[0];
    if (!isValidUUID(shippingZoneId)) {
        throwError('INVALID_SHIPPING_ZONE');
    }

    const { paymentMethodId, name, additionalDetails, price } = req.body;

    const useCase = new AddShippingOption({
        shippingZoneId,
        paymentMethodId,
        name,
        additionalDetails,
        price,
        isEnabled: true,
    });
    const option = await useCase.execute();

    res.send(option);
}

async function getShippingOptions(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const shippingZoneId = params[0];
    if (!isValidUUID(shippingZoneId)) {
        throwError('INVALID_SHIPPING_ZONE');
    }

    const useCase = new GetShippingOptions(shippingZoneId);
    const options = await useCase.execute();

    res.send(options);
}

async function updateShippingOption(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const shippingZoneId = params[0];
    if (!isValidUUID(shippingZoneId)) {
        throwError('INVALID_SHIPPING_ZONE');
    }

    const shippingOptionId = params[2];
    if (!isValidUUID(shippingOptionId)) {
        throwError('INVALID_ID');
    }

    const { paymentMethodId, name, additionalDetails, price } = req.body;

    const useCase = new UpdateShippingOption({
        shippingZoneId,
        paymentMethodId,
        name,
        additionalDetails,
        price,
        isEnabled: true,
    });
    const option = await useCase.execute();

    res.send(option);
}

async function deleteShippingOption(req: any, res: any) {
    const {
        query: { params },
    } = req;

    const shippingZoneId = params[0];
    if (!isValidUUID(shippingZoneId)) {
        throwError('INVALID_SHIPPING_ZONE');
    }

    const shippingOptionId = params[2];
    if (!isValidUUID(shippingOptionId)) {
        throwError('INVALID_ID');
    }

    const { paymentMethodId } = req.body;

    const useCase = new DeleteShippingOption({
        id: shippingOptionId,
        shippingZoneId,
        paymentMethodId,
    });
    const option = await useCase.execute();

    res.send(option);
}
