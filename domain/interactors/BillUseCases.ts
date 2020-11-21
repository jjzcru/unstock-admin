import { UseCase } from './UseCase';
import { BillRepository } from '../repository/BillRepository';
import { Bill, BillPayment } from '../model/Bill';
import BillDataRepository from '@data/db/BillDataRepository';
import { throwError } from '@errors';

export class GetBills implements UseCase {
    private storeId: string;
    BillRepository: BillRepository;

    constructor(
        storeId: string,
        repository: BillRepository = new BillDataRepository()
    ) {
        this.storeId = storeId;
        this.BillRepository = repository;
    }
    async execute(): Promise<Bill[]> {
        const bills = await this.BillRepository.get(this.storeId);
        if (!!bills.length) {
            for (const bill of bills) {
                const { id } = bill;
                bill.items = await this.BillRepository.GetBillItems(id);

                if (bill.status === 'pending') {
                    bill.items.push({
                        title: 'Consumo por ventas',
                        description:
                            '2% del total generado por ventas en la herramienta.',
                        amount: 4.98,
                        qty: 1,
                    });
                }
                bill.payments = await this.BillRepository.GetBillPayments(id);
            }
        }
        return bills;
    }
}

export class PayBill implements UseCase {
    params: AddPaymentParams;
    BillRepository: BillRepository;

    constructor(
        params: AddPaymentParams,
        repository: BillRepository = new BillDataRepository()
    ) {
        this.params = params;
        this.BillRepository = repository;
    }
    async execute(): Promise<BillPayment> {
        const { bill_id, type, amount } = this.params;
        const payment = await this.BillRepository.AddBillPayment({
            bill_id,
            type,
            amount,
        });

        return payment;
    }
}

export class AddBillImage implements UseCase {
    params: AddPaymentImageParams;
    private repository: BillRepository;

    constructor(
        params: AddPaymentImageParams,
        repository: BillRepository = new BillDataRepository()
    ) {
        this.params = params;
        this.repository = repository;
    }

    execute(): Promise<boolean> {
        const { payment_id, image } = this.params;
        return this.repository.AddBillImage({
            image,
            payment_id,
        });
    }
}

export interface AddPaymentParams {
    bill_id?: string;
    type?: string;
    amount?: number;
}

export interface AddPaymentImageParams {
    payment_id?: string;
    image?: AddImageParams;
}

export interface AddImageParams {
    path: string;
    name: string;
}
