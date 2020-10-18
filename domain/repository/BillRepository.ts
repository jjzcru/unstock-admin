import { Bill, BillPayment } from '../model/Bill';

export interface BillRepository {
    get(storeId: string): Promise<Bill[]>;
    GetBillPayments(billId: string): Promise<BillPayment[]>;
    AddBillPayment(params: AddPaymentParams): Promise<BillPayment>;
}

export interface AddPaymentParams {
    bill_id?: string;
    type?: string;
    amount?: number;
}
