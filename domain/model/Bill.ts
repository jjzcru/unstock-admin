export interface Bill {
    id?: string;
    storeId?: string;
    amount?: number;
    title?: string;
    description?: string;
    items?: Items[];
    notes?: string;
    status?: 'pending' | 'partially_paid' | 'paid';
    createdAt?: Date;
    payments?: BillPayment[];
}

export interface BillPayment {
    id?: string;
    bill_id?: string;
    type?: string;
    src?: string;
    amount?: number;
    status?: string;
    notes?: string;
    reference?: string;
    createdAt?: Date;
}

export interface Items {
    title?: string;
    description?: string;
    amount?: number;
    qty?: number;
}
