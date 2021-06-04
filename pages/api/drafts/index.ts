import { GetDrafts, CreateDraft } from '@domain/interactors/DraftUseCases';

import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getDrafts);
            break;
        case 'POST':
            await proxyRequest(req, res, createDraft);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getDrafts(req: any, res: any) {
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }
    const filters = req.query;
    const useCase = new GetDrafts({ storeId, filters });
    const drafts = await useCase.execute();
    res.send({ drafts });
}

async function createDraft(req: any, res: any) {
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    const {
        address,
        subtotal,
        tax,
        total,
        currency,
        shippingType,
        status,
        items,
        message,
        pickupLocation,
        paymentMethod,
        shippingOption,
        costumer,
        shippingLocation,
    } = req.body;

    const useCase = new CreateDraft({
        storeId,
        address: address || null,
        subtotal: subtotal || 0,
        tax: tax || null,
        total: total || 0,
        currency: currency || null,
        shippingType: shippingType || null,
        status: status || 'open',
        items: items || [],
        message: message || '',
        pickupLocation: pickupLocation || null,
        paymentMethod: paymentMethod || null,
        shippingOption: shippingOption || null,
        costumer: costumer || null,
        shippingLocation: shippingLocation || null,
    });

    const draft = await useCase.execute();
    res.send({ draft });
}
