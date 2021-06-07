import { runQuery } from './db';
import {
    DraftParams,
    DraftRepository,
    DraftOrderItemParams,
} from '@domain/repository/DraftRepository';
import { Order, Address, OrderItem } from '@domain/model/Order';
import { Draft, DraftOrderItem } from '@domain/model/Draft';

export default class DraftDataRepository implements DraftRepository {
    async createDraft(params: DraftParams): Promise<Draft> {
        const {
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        } = params;

        const query = `INSERT INTO public.store_draft_order
    (store_id, address, subtotal, tax, total, currency, shipping_type, status, message,  pickup_location, shipping_option, payment_method, costumer_id, costumer, shipping_location)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) returning *;`;
        const values = [
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            message,
            pickupLocation,
            shippingOption,
            paymentMethod,
            null,
            costumer,
            shippingLocation,
        ];

        const { rows } = await runQuery(query, values);

        return rows && rows.length ? mapRowToDraft(rows[0]) : null;
    }

    async updateDraft(draftId: string, params: DraftParams): Promise<Draft> {
        const {
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        } = params;
        console.log(params, draftId);

        const query = `UPDATE public.store_draft_order
        SET store_id=$1, address=$2, subtotal=$3, tax=$4, total=$5, currency=$6, shipping_type=$7, status=$8, message=$9, pickup_location=$10, payment_method=$11, shipping_option=$12,  costumer=$13, shipping_location=$14
        WHERE id=$15
         RETURNING *;`;

        const values = [
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
            draftId,
        ];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapRowToDraft(rows[0]) : null;
    }

    async getDrafts(storeId: string, filters: any): Promise<Draft[]> {
        let status = 'open';
        if (filters.status) status = filters.status;
        const query = `SELECT * FROM store_draft_order 
        WHERE store_id=$1 AND status = $2
        ORDER BY created_at DESC;`;
        const values = [storeId, status];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows.map(mapRowToDraft);
    }

    async getDraftsById(storeId: string, draftId: string): Promise<Draft> {
        const query = `SELECT * FROM store_draft_order 
        WHERE store_id=$1 AND id = $2
        ORDER BY created_at DESC
        LIMIT 1;`;
        console.log({ storeId, draftId });
        const values = [storeId, draftId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapRowToDraft(rows[0]) : null;
    }

    async cancelDraft(storeId: string, draftId: string): Promise<Draft> {
        const query = `UPDATE public.store_draft_order
        SET status='cancelled'
        WHERE id=$1
         RETURNING *;`;
        const values = [draftId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows && rows.length ? mapRowToDraft(rows[0]) : null;
    }
    async archiveDraft(storeId: string, draftId: string): Promise<Draft> {
        const query = `UPDATE public.store_draft_order
        SET status='archived'
        WHERE id=$1
         RETURNING *;`;
        const values = [draftId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows && rows.length ? mapRowToDraft(rows[0]) : null;
    }

    async paidDraft(storeId: string, draftId: string): Promise<Draft> {
        const query = `UPDATE public.store_draft_order
        SET status='paid'
        WHERE id=$1
         RETURNING *;`;
        const values = [draftId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows && rows.length ? mapRowToDraft(rows[0]) : null;
    }

    async getDraftItems(draftId: string): Promise<DraftOrderItem[]> {
        const query = `SELECT id, draft_order_id, variant_id, price, sku, quantity
        FROM store_draft_order_item where draft_order_id = $1;`;
        const values = [draftId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows.map(mapItem);
    }

    async addDraftItem(
        storeId: string,
        draftId: string,
        item: DraftOrderItemParams
    ): Promise<DraftOrderItem> {
        const { variantId, price, sku, quantity } = item;

        const query = `INSERT INTO public.store_draft_order_item
        (draft_order_id, variant_id, price, sku, quantity)
        VALUES( $1, $2, $3, $4, $5)
        returning *;`;
        const values = [draftId, variantId, price, sku, quantity];

        const { rows } = await runQuery(query, values);

        return rows && rows.length ? rows[0] : null;
    }

    async removeDraftItem(
        storeId: string,
        draftId: string,
        id: string
    ): Promise<DraftOrderItem> {
        const query = ` DELETE FROM public.store_draft_order_item
        WHERE id=$1 AND draft_order_id=$2;`;
        console.log(query);
        const values = [id, draftId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows[0] : null;
    }

    async updateDraftItem(
        storeId: string,
        draftId: string,
        id: string,
        item: DraftOrderItemParams
    ): Promise<DraftOrderItem> {
        const query = `UPDATE public.store_draft_order_item
        SET variant_id=$3, price=$4, sku=$5, quantity=$6
        WHERE id= $1 AND draft_order_id=$2
         RETURNING *;`;
        const values = [
            id,
            draftId,
            item.variantId,
            item.price,
            item.sku,
            item.quantity,
        ];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows[0] : null;
    }
}

function mapRowToDraft(row: any): Draft {
    const {
        id,
        store_id,
        shipping_type,
        currency,
        total,
        subtotal,
        status,
        tax,
        address,
        message,
        created_at,
        updated_at,
        cancelled_at,
        cancel_reason,
        costumer,
        payment_method,
        shipping_option,
        pickup_location,
        shipping_location,
        draft_number,
    } = row;

    return {
        id,
        storeId: store_id,
        total: parseFloat(`${total}`),
        currency,
        subtotal: parseFloat(`${subtotal}`),
        shippingType: shipping_type,
        tax: parseFloat(`${tax}`),
        address: mapAddress(address),
        status,
        message,
        createdAt: created_at,
        updatedAt: updated_at,
        cancelledAt: cancelled_at,
        cancelReason: cancel_reason,
        costumer,
        paymentMethod: payment_method,
        pickupLocation: pickup_location,
        shippingOption: shipping_option,
        shippingLocation: shipping_location,
        draftNumber: draft_number,
    };
}

function mapAddress(address: any): Address {
    if (!address) {
        return null;
    }

    const {
        address_1,
        address_2,
        city,
        province,
        delivery_instructions,
    } = address;

    return {
        address1: address_1,
        address2: address_2,
        city,
        province,
        deliveryInstructions: delivery_instructions,
    };
}

function mapItem(row: any): DraftOrderItem {
    if (!row) {
        return null;
    }

    const { id, draft_order_id, variant_id, price, sku, quantity } = row;

    return {
        id,
        draftId: draft_order_id,
        variantId: variant_id,
        price,
        sku,
        quantity,
        variant: null,
        title: '',
    };
}
