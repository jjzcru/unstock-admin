import {
    GetDraftsById,
    ArchiveDraft,
    DraftToOrder,
    CancelDraft,
    UpdateDraft,
} from '@domain/interactors/DraftUseCases';
import { isValidUUID, getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, getDraftByID);
            break;
        case 'PUT':
            await proxyRequest(req, res, processPut);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function getDraftByID(req: any, res: any) {
    const {
        query: { slug },
    } = req;

    if (slug.length !== 1) {
        throwError('NOT_FOUND');
    }

    const draftId = slug[0];
    if (!isValidUUID(draftId)) {
        throwError('INVALID_ORDER');
    }

    const storeId = getStoreID(req);

    const useCase = new GetDraftsById(draftId, storeId);
    const draft = await useCase.execute();
    res.send({ draft });
}

async function processPut(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    if (slug.length === 2) {
        const draftId = slug[0];
        if (!isValidUUID(draftId)) {
            throwError('INVALID_ORDER');
        }

        switch (slug[1]) {
            case 'cancel':
                await cancelDraft(req, res);
                break;
            case 'archive':
                await archiveDraft(req, res);
                break;
            case 'paid':
                await MarkAsPaid(req, res);
                break;
            default:
                res.status(404).send({ error: 'Not found' });
        }
    } else if (slug.length === 1) {
        const draftId = slug[0];
        if (!isValidUUID(draftId)) {
            throwError('INVALID_ORDER');
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
        const params = {
            storeId,
            address: address || null,
            subtotal: subtotal || null,
            tax: tax || null,
            total: total || null,
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
        };

        const useCase = new UpdateDraft(params, draftId);
        const draft = await useCase.execute();
        res.send({ draft });
    } else {
        throwError('NOT_FOUND');
    }
}

async function cancelDraft(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const draftId = slug[0];
    if (!isValidUUID(draftId)) {
        throwError('INVALID_ORDER');
    }
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    const useCase = new CancelDraft(draftId, storeId);
    const draft = await useCase.execute();
    res.send({ draft });
}

async function archiveDraft(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const draftId = slug[0];
    if (!isValidUUID(draftId)) {
        throwError('INVALID_ORDER');
    }
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    const useCase = new ArchiveDraft(draftId, storeId);
    const draft = await useCase.execute();
    res.send({ draft });
}

async function MarkAsPaid(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    const draftId = slug[0];
    if (!isValidUUID(draftId)) {
        throwError('INVALID_ORDER');
    }
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    const useCase = new DraftToOrder(draftId, storeId);
    const draft = await useCase.execute();
    res.send({ draft });
}
