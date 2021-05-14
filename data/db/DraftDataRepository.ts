import { runQuery } from './db';
import {
    DraftParams,
    DraftRepository,
} from '@domain/repository/DraftRepository';
import { Order, Address } from '@domain/model/Order';
import { Draft } from '@domain/model/Draft';

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
            items,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        } = params;

        const query = `INSERT INTO public.store_draft_order
    (store_id, address, subtotal, tax, total, currency, shipping_type, status, message, created_at,  pickup_location, shipping_option, payment_method, costumer_id, costumer, shipping_location)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10, $11, $12, $13, $14, $15) returning *;`;
        const values = [
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            items,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
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
            items,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        } = params;

        const query = `UPDATE public.store_draft_order
        SET store_id=$1, address=$2, subtotal=$3, tax=$4, total=$5, currency=$6, shipping_type=$7, status=$8, message=$9,  updated_at=now(), pickup_location=$10, shipping_option=$11, payment_method=$12, costumer_id=$13, costumer=$14, shipping_location=$15
        WHERE id=$16;
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
            items,
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
        const query = `SELECT * FROM store_draft_order 
        WHERE store_id=$1
        ORDER BY created_at DESC;`;
        const values = [storeId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows.map(mapRowToDraft);
    }

    async cancelDraft(storeId: string, draftId: string): Promise<Draft> {
        const query = `UPDATE public.store_draft_order
        SET status='cancelled'
        WHERE id=$1
         RETURNING *;`;
        const values = [draftId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows.map(mapRowToDraft);
    }
    async archiveDraft(storeId: string, draftId: string): Promise<Draft> {
        const query = `UPDATE public.store_draft_order
        SET status='archived'
        WHERE id=$1
         RETURNING *;`;
        const values = [draftId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows.map(mapRowToDraft);
    }

    async paidDraft(storeId: string, draftId: string): Promise<Draft> {
        const query = `UPDATE public.store_draft_order
        SET status='paid'
        WHERE id=$1
         RETURNING *;`;
        const values = [draftId];
        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows.map(mapRowToDraft);
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
