export interface Costumer {
    id?: string;
    userId?: string;
    storeId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    currency?: string;
    acceptMarketing?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface StoreCostumer {
    id?: string;
}
