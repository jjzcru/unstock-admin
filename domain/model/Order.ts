import { PaymentMethod } from './Payment';
import { PickupLocation } from './PickupLocation';
import { ShippingOption } from './Shipping';
import { Costumer } from './Costumer';

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
    orderNumber?: number;
    costumer?: any;
    paymentMethod?: any;
    pickupLocation?: any;
    shippingOption?: any;
    shippingLocation?: any;
}

export interface Address {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    deliveryInstructions?: string;
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface CartItem {
    id: string;
    quantity: number;
}

export interface OrderItem {
    id?: string;
    variantId: string;
    productId?: string;
    variant: any;
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

export interface OrderInput {
    storeId: string;
    id: string;
    shippingType: 'shipment' | 'pickup';
    paymentMethodId: string;
    costumer: Costumer;
    items: CartItem[];
    location?: Location;
    address?: Address;
    lang?: string;
}
