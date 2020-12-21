import { Bill, BillPayment, Items } from '../model/Bill';

export interface BillRepository {
    getBillItems(id: string): Promise<Items[]>;
    get(storeId: string): Promise<Bill[]>;
    getBillPayments(billId: string): Promise<BillPayment[]>;
    addBillPayment(params: AddPaymentParams): Promise<BillPayment>;
    addBillImage(params: AddPaymentImageParams): Promise<boolean>;
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
