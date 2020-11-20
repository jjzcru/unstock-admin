import { Bill, BillPayment, Items } from '../model/Bill';

export interface BillRepository {
    GetBillItems(id: string): Promise<Items[]>;
    get(storeId: string): Promise<Bill[]>;
    GetBillPayments(billId: string): Promise<BillPayment[]>;
    AddBillPayment(params: AddPaymentParams): Promise<BillPayment>;
    AddBillImage(params: AddPaymentImageParams): Promise<boolean>;
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
