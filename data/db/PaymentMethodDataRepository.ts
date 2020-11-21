import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { PaymentMethod } from '@domain/model/PaymentMethod';
import { PaymentMethodRepository } from '@domain/repository/PaymentMethodRepository';

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
}

function mapPaymentMethod(row: any): PaymentMethod {
    return {
        id: row.id,
        storeId: row.store_id,
        name: row.name,
        type: row.type,
        aditionalDetails: row.aditional_details,
        paymentInstructions: row.payment_instructions,
        isEnabled: row.is_enabled,
        createdAt: row.create_at,
        updatedAt: row.updated_at,
    };
}
