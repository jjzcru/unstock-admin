import { Draft } from '../model/Draft';
import { Address, OrderItem } from '../model/Order';

export interface DraftRepository {
    getDrafts(storeId: string, filters: any): Promise<Draft[]>;
    createDraft(params: DraftParams): Promise<Draft>;
    updateDraft(draftId: string, params: DraftParams): Promise<Draft>;
    cancelDraft(storeId: string, draftId: string): Promise<Draft>;
    archiveDraft(storeId: string, draftId: string): Promise<Draft>;
    paidDraft(storeId: string, draftId: string): Promise<Draft>;
}

export interface DraftParams {
    storeId?: string;
    address?: Address;
    subtotal?: number;
    tax?: number;
    total?: number;
    currency?: string;
    shippingType: 'pickup' | 'delivery' | 'shipment';
    status: 'open' | 'archived' | 'cancelled';
    items?: OrderItem[];
    message?: string;
    pickupLocation?: any;
    paymentMethod?: any;
    shippingOption?: any;
    costumer?: any;
    shippingLocation?: any;
}
