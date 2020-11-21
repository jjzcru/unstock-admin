import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { PaymentMethod } from '@domain/model/PaymentMethod';
import {
    AddPaymentMethodParams,
    PaymentMethodRepository,
    UpdatePaymentMethodParams,
} from '@domain/repository/PaymentMethodRepository';

export default class PaymentMethodDataRepository
    implements PaymentMethodRepository {
    private pool: Pool;
    constructor() {
        this.pool = getConnection();
    }

    async get(storeId: string): Promise<PaymentMethod[]> {
        let client: PoolClient;
        const query = `SELECT * FROM store_payment_method WHERE store_id = '${storeId}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();

            return res.rows.map(mapPaymentMethod);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async add(
        params: AddPaymentMethodParams,
        storeId: string
    ): Promise<PaymentMethod> {
        let client: PoolClient;
        const query = `
        INSERT INTO public.store_payment_method
        ( store_id, "name", "type", additional_details, payment_instructions, is_enabled)
        VALUES($1, $2, $3, $4, $5, true) returning *;`;
        console.log(query);

        const { name, type, aditionalDetails, paymentInstructions } = params;

        try {
            client = await this.pool.connect();
            const res = await client.query(query, [
                storeId,
                name,
                type,
                aditionalDetails,
                paymentInstructions,
            ]);

            client.release();
            return mapPaymentMethod(res.rows[0]);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
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
        let client: PoolClient;
        const query = `
        UPDATE store_payment_method SET 
        name=$1, type=$2, additional_details=$3, payment_instructions=$4,
        is_enabled = $5
        WHERE id = $6
        RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query, [
                name,
                type,
                aditionalDetails,
                paymentInstructions,
                enabled,
                id,
            ]);

            client.release();
            return mapPaymentMethod(res.rows[0]);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async delete(id: string, storeId: string): Promise<PaymentMethod> {
        let client: PoolClient;
        const query = `
        UPDATE store_payment_method SET 
        is_enabled = false
        WHERE id = $1 AND store_id = $2
        RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query, [id, storeId]);

            client.release();
            return mapPaymentMethod(res.rows[0]);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
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
