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

export interface AddPaymentParams {
    bill_id?: string;
    type?: string;
    amount?: number;
}