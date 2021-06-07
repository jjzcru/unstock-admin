import { Costumer } from './Costumer';
import { Variant } from './Product';
import { Address } from './Order';

export interface Draft {
    id?: string;
    storeId?: string;
    address?: Address;
    subtotal?: number;
    tax?: number;
    total?: number;
    currency?: string;
    shippingType: 'pickup' | 'delivery' | 'shipment';
    status: 'open' | 'archived' | 'cancelled' | 'paid'; // se agrego el status paid, se debe agregar en la base de datos (enum)
    items?: DraftOrderItem[];
    message?: string;
    createdAt?: Date;
    updatedAt?: Date;
    cancelledAt?: Date;
    pickupLocation?: any;
    shippingOption?: any;
    costumer?: any;
    shippingLocation?: any;
    paymentMethod?: any;
    cancelReason?: string;
    createdBy?: any;
    orderId?: string;
    draftNumber?: number;
}

export interface DraftOrderItem {
    id?: string;
    draftId?: string;
    variantId: string;
    price?: number;
    sku: string;
    quantity: number;
    variant: Variant;
    title: string;
}
