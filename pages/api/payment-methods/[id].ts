import {
    DeletePaymentMethods,
    UpdatePaymentMethods,
} from '@domain/interactors/PaymentMethodUseCase';
import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'DELETE':
            await proxyRequest(req, res, DeletePaymentMethod);
            break;
        case 'PUT':
            await proxyRequest(req, res, UpdatePaymentMethod);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function UpdatePaymentMethod(req: any, res: any) {
    const {
        query: { id },
    } = req;

    const {
        name,
        type,
        aditionalDetails,
        paymentInstructions,
        enabled,
    } = req.body;

    const useCase = new UpdatePaymentMethods({
        id,
        name,
        type,
        aditionalDetails,
        paymentInstructions,
        enabled,
    });
    const method = await useCase.execute();
    res.send({ method });
}

async function DeletePaymentMethod(req: any, res: any) {
    const storeId = getStoreID(req);
    const {
        query: { id },
    } = req;
    const useCase = new DeletePaymentMethods(id, storeId);
    const method = await useCase.execute();
    res.send({ method });
}
