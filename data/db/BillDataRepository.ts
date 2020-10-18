import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { Bill, BillPayment } from '@domain/model/Bill';
import {
    BillRepository,
    AddPaymentParams,
} from '@domain/repository/BillRepository';

export default class BillDataRepository implements BillRepository {
    private pool: Pool;
    constructor() {
        this.pool = getConnection();
    }

    async get(storeId: string): Promise<Bill[]> {
        let client: PoolClient;
        const query = `SELECT * FROM store_bill WHERE store_id = '${storeId}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();

            return res.rows.map(mapBill);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async AddBillPayment(params: AddPaymentParams): Promise<BillPayment> {
        let client: PoolClient;
        const query = `INSERT INTO bill_payment (bill_id, type, amount)
        VALUES ($1, $2, $3) returning *;`;
        const { bill_id, type, amount } = params;

        try {
            client = await this.pool.connect();
            const res = await client.query(query, [bill_id, type, amount]);
            client.release();
            return res.rows[0];
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async GetBillPayments(billId: string): Promise<BillPayment[]> {
        let client: PoolClient;
        const query = `SELECT * FROM bill_payment WHERE bill_id = '${billId}'`;
        try {
            client = await this.pool.connect();
            const res = await client.query(query);
            client.release();

            return res.rows;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
}

function mapBill(row: any): Bill {
    return {
        id: row.id,
        storeId: row.store_id,
        title: row.title,
        amount: row.amount,
        description: row.description,
        items: row.items,
        notes: row.notes,
        status: row.status,
        createdAt: row.createdAt,
    };
}
