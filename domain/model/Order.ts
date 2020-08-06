export interface Order {
    id?: string;
    storeId?: string;
    address?: Address;
    total?: number;
    subtotal?: number;
    tax?: number;
    status?: string;
    shipments?: string;
    createdAt?: Date;
    message: '';
}

export interface Address {
    id?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    addressOptional?: string;
    postalCode?: string;
    mapAddress: MapAddress;
}

export interface MapAddress {
    latitude: number;
    longitude: number;
}

export interface OrderItem {
    id?: string;
    variantId: string;
    productId: string;
    product: any;
    orderId: string;
    shipmentId: string;
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
