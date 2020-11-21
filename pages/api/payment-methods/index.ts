import { GetPaymentMethods } from '@domain/interactors/PaymentMethodUseCase';
import { getStoreID } from '@utils/uuid';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'GET':
            await proxyRequest(req, res, GetPayments);
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
