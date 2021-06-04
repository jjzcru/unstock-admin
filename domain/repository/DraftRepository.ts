import { Draft, DraftOrderItem } from '../model/Draft';
import { Address, OrderItem } from '../model/Order';

export interface DraftRepository {
    getDrafts(storeId: string, filters: any): Promise<Draft[]>;
    getDraftsById(storeId: string, draftId: string): Promise<Draft>;
    createDraft(params: DraftParams): Promise<Draft>;
    updateDraft(draftId: string, params: DraftParams): Promise<Draft>;
    cancelDraft(storeId: string, draftId: string): Promise<Draft>;
    archiveDraft(storeId: string, draftId: string): Promise<Draft>;
    paidDraft(storeId: string, draftId: string): Promise<Draft>;
    getDraftItems(draftId: string): Promise<DraftOrderItem[]>;
    addDraftItem(
        storeId: string,
        draftId: string,
        item: DraftOrderItemParams
    ): Promise<DraftOrderItem>;
    removeDraftItem(
        storeId: string,
        draftId: string,
        id: string
    ): Promise<DraftOrderItem>;

    updateDraftItem(
        storeId: string,
        draftId: string,
        id: string,
        item: DraftOrderItemParams
    ): Promise<DraftOrderItem>;
}

export interface DraftOrderItemParams {
    id: any;
    draftId: string;
    variantId: string;
    price?: number;
    sku: string;
    quantity: number;
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
    items?: DraftOrderItemParams[];
    message?: string;
    pickupLocation?: any;
    paymentMethod?: any;
    shippingOption?: any;
    costumer?: any;
    shippingLocation?: any;
}
