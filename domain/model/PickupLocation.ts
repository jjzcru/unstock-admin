export interface PickupLocation {
    id?: string;
    storeId?: string;
    name?: string;
    additionalDetails: string;
    latitude: number;
    longitude: number;
    isEnabled?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PickupLocationOption {
    id?: string;
    paymentMethodId?: string;
    pickupLocationId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
