import { PaymentMethod } from '../model/PaymentMethod';

export interface PaymentMethodRepository {
    get(storeId: string): Promise<PaymentMethod[]>;
    add(
        params: AddPaymentMethodParams,
        storeId: string
    ): Promise<PaymentMethod>;
    update(
        id: string,
        params: UpdatePaymentMethodParams
    ): Promise<PaymentMethod>;
    delete(id: string, storeId: string): Promise<PaymentMethod>;
}

export interface AddPaymentMethodParams {
    storeId?: string;
    name?: string;
    type?:
        | 'bank_deposit'
        | 'cash'
        | 'cash_on_delivery'
        | 'custom'
        | 'external_credit'
        | 'external_debit'
        | 'gift_card'
        | 'money_order'
        | 'store_credit'
        | 'credit_card'
        | 'debit_card'
        | 'providers';
    aditionalDetails?: string;
    paymentInstructions?: string;
}

export interface UpdatePaymentMethodParams {
    id?: string;
    name?: string;
    type?:
        | 'bank_deposit'
        | 'cash'
        | 'cash_on_delivery'
        | 'custom'
        | 'external_credit'
        | 'external_debit'
        | 'gift_card'
        | 'money_order'
        | 'store_credit'
        | 'credit_card'
        | 'debit_card'
        | 'providers';
    aditionalDetails?: string;
    paymentInstructions?: string;
    enabled?: boolean;
}
