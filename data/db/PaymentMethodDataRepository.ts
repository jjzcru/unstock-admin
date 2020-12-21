import { runQuery } from './db';
import { PaymentMethod } from '@domain/model/PaymentMethod';
import {
    AddPaymentMethodParams,
    PaymentMethodRepository,
    UpdatePaymentMethodParams,
} from '@domain/repository/PaymentMethodRepository';

export default class PaymentMethodDataRepository
    implements PaymentMethodRepository {
    async get(storeId: string): Promise<PaymentMethod[]> {
        const query = `SELECT * FROM store_payment_method WHERE store_id = $1`;

        const values = [storeId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows.map(mapPaymentMethod) : null;
    }

    async add(
        params: AddPaymentMethodParams,
        storeId: string
    ): Promise<PaymentMethod> {
        const { name, type, aditionalDetails, paymentInstructions } = params;
        const query = `
        INSERT INTO public.store_payment_method
        ( store_id, "name", "type", additional_details, payment_instructions, is_enabled)
        VALUES($1, $2, $3, $4, $5, true) returning *;`;

        const values = [
            storeId,
            name,
            type,
            aditionalDetails,
            paymentInstructions,
        ];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return mapPaymentMethod(rows[0]);
        }

        return null;
    }

    async update(
        id: string,
        params: UpdatePaymentMethodParams
    ): Promise<PaymentMethod> {
        const {
            name,
            type,
            aditionalDetails,
            paymentInstructions,
            enabled,
        } = params;
        const query = `
        UPDATE store_payment_method SET 
        name=$1, type=$2, additional_details=$3, payment_instructions=$4,
        is_enabled = $5
        WHERE id = $6
        RETURNING *;`;

        const values = [
            name,
            type,
            aditionalDetails,
            paymentInstructions,
            enabled,
            id,
        ];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return mapPaymentMethod(rows[0]);
        }

        return null;
    }

    async delete(id: string, storeId: string): Promise<PaymentMethod> {
        const query = `
        UPDATE store_payment_method SET 
        is_enabled = false
        WHERE id = $1 AND store_id = $2
        RETURNING *;`;

        const values = [id, storeId];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return mapPaymentMethod(rows[0]);
        }

        return null;
    }
}

function mapPaymentMethod(row: any): PaymentMethod {
    return {
        id: row.id,
        storeId: row.store_id,
        name: row.name,
        type: row.type,
        aditionalDetails: row.additional_details,
        paymentInstructions: row.payment_instructions,
        isEnabled: row.is_enabled,
        createdAt: row.create_at,
        updatedAt: row.updated_at,
    };
}
