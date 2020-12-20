import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { Bill, BillPayment, Items } from '@domain/model/Bill';
import {
    BillRepository,
    AddPaymentParams,
    AddPaymentImageParams,
} from '@domain/repository/BillRepository';
import FileService from '@data/services/FileServices';
import { v4 as uuidv4 } from 'uuid';

import path from 'path';

export default class BillDataRepository implements BillRepository {
    private pool: Pool;
    private fileService: FileService;
    constructor() {
        this.pool = getConnection();
        this.fileService = new FileService();
    }

    async AddBillImage(params: AddPaymentImageParams): Promise<boolean> {
        let client: PoolClient;
        try {
            const extensionRegex = /(?:\.([^.]+))?$/;
            const id = uuidv4();
            const ext = extensionRegex.exec(params.image.name)[1];
            const result = await this.fileService.uploadImages({
                filePath: params.image.path,
                key: `payments/${id}.${ext}`,
                bucket: 'unstock-admin',
            });

            const query = `UPDATE bill_payment
             SET src='${result.url}'
             WHERE id='${params.payment_id}';`;

            const billInfo = `SELECT bill_id FROM bill_payment
            WHERE id='${params.payment_id}';`;

            client = await this.pool.connect();

            const res = await client.query(query);

            const billId = await client.query(billInfo);

            const updateBill = `UPDATE store_bill
            SET status='paid'
            WHERE id='${billId.rows[0].bill_id}';`;

            await client.query(updateBill);

            client.release();

            return true;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
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

    async GetBillItems(billId: string): Promise<Items[]> {
        let client: PoolClient;
        const query = `SELECT * FROM store_bill_item WHERE bill_id = '${billId}'`;
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
        amount: row.amount,
        items: row.items,
        notes: row.notes,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
