export interface PaymentMethod {
    id?: string;
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
    isEnabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
