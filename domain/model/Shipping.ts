export interface ShippingZone {
    id?: string;
    storeId?: string;
    name?: string;
    path?: number[][];
    isEnabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ShippingOption {
    id?: string;
    paymentMethodId?: string;
    shippingZoneId?: string;
    name?: string;
    additionalDetails?: string;
    price?: number;
    isEnabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
