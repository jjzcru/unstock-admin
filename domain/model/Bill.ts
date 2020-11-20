export interface Bill {
    id?: string;
    storeId?: string;
    amount?: number;
    items?: Items[];
    notes?: string;
    status?: 'pending' | 'complete' | 'partially_paid' | 'paid';
    createdAt?: Date;
    updatedAt?: Date;
    payments?: BillPayment[];
}

export interface BillPayment {
    id?: string;
    bill_id?: string;
    type?: string;
    src?: string;
    amount?: number;
    status?: 'pending' | 'verified';
    notes?: string;
    reference?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Items {
    title?: string;
    description?: string;
    amount?: number;
    qty?: number;
}
