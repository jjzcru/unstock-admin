export interface Order {
    id?: string;
    storeId?: string;
    address?: Address;
    checkoutId?: string;
    total?: number;
    subTotal?: number;
    shippingType: 'pickup' | 'local_delivery';
    fullfillmentStatus?: 'fulfilled' | 'partial' | 'restocked' | null;
    financialStatus: 'pending' | 'paid' | 'refunded';
    tax?: number;
    email?: string;
    status: 'open' | 'closed' | 'cancelled';
    shipments?: Shipment[];
    items?: OrderItem[];
    message?: string;
    createdAt?: Date;
    updatedAt?: Date;
    closedAt?: Date;
    cancelledAt?: Date;
    cancelReason?:
        | 'customer'
        | 'fraud'
        | 'inventory'
        | 'declined'
        | 'other'
        | null;
}

export interface Address {
    id?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    addressOptional?: string;
    postalCode?: string;
    mapAddress?: MapAddress;
}

export interface MapAddress {
    latitude: number;
    longitude: number;
}

export interface OrderItem {
    id?: string;
    variantId: string;
    productId?: string;
    product: any;
    orderId?: string;
    shipmentId?: string;
    quantity: number;
}

export interface Shipment {
    id?: string;
    items?: OrderItem[];
    carrier?: Carrier;
    tracking: string;
}

export interface Carrier {
    id?: string;
    name?: string;
}
