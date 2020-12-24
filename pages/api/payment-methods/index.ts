import {
    GetPaymentMethods,
    AddPaymentMethods,
    DeletePaymentMethods,
} from '@domain/interactors/PaymentMethodUseCase';
import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, GetPayments);
            break;
        case 'POST':
            await proxyRequest(req, res, AddPaymentMethod);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function GetPayments(req: any, res: any) {
    const storeId = getStoreID(req);
    const useCase = new GetPaymentMethods(storeId);
    const methods = await useCase.execute();
    res.send({ methods });
}

async function AddPaymentMethod(req: any, res: any) {
    const storeId = getStoreID(req);
    console.log(req.body);
    const { name, type, aditionalDetails, paymentInstructions } = req.body;
    console.log(name);
    const useCase = new AddPaymentMethods({
        name,
        type,
        aditionalDetails,
        paymentInstructions,
        storeId,
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
