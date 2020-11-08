import { PayBill } from '@domain/interactors/BillUseCases';
import { proxyRequest } from '@utils/request';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'PUT':
            await proxyRequest(req, res, addPayment);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function addPayment(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const { type, amount } = req.body;

    const useCase = new PayBill({
        bill_id: id,
        type: type || 'bank_deposit',
        amount,
    });

    const payment = await useCase.execute();
    res.send({ payment });
}
