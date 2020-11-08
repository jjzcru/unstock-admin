export interface Order {
    id?: string;
    storeId?: string;
    address?: Address;
    checkoutId?: string;
    tax?: number;
    subtotal?: number;
    total?: number;
    currency?: string;
    shippingType: 'pickup' | 'delivery' | 'shipment';
    fulfillmentStatus?: 'fulfilled' | 'partial' | 'restocked' | null;
    financialStatus:
        | 'pending'
        | 'paid'
        | 'refunded'
        | 'partially_refunded'
        | 'partially_paid';
    email?: string;
    phone?: string;
    status: 'open' | 'closed' | 'cancelled';
    shipments?: Shipment[];
    items?: OrderItem[];
    message?: string;
    cancelReason?:
        | 'customer'
        | 'fraud'
        | 'inventory'
        | 'declined'
        | 'other'
        | null;
    createdAt?: Date;
    updatedAt?: Date;
    closedAt?: Date;
    cancelledAt?: Date;
}

export interface Address {
    id?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    addressOptional?: string;
    postalCode?: string;
    location?: Location;
}

export interface Location {
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
