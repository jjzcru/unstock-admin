import { runQuery } from './db';
import { Bill, BillPayment, Items } from '@domain/model/Bill';
import {
    BillRepository,
    AddPaymentParams,
    AddPaymentImageParams,
} from '@domain/repository/BillRepository';
import FileService from '@data/services/FileServices';
import { v4 as uuidv4 } from 'uuid';

import path from 'path';

export class BillDataRepository implements BillRepository {
    private fileService: FileService;
    constructor() {
        this.fileService = new FileService();
    }

    async AddBillImage(params: AddPaymentImageParams): Promise<boolean> {
        const extensionRegex = /(?:\.([^.]+))?$/;
        const id = uuidv4();
        const ext = extensionRegex.exec(params.image.name)[1];

        const result = await this.fileService.uploadImages({
            filePath: params.image.path,
            key: `payments/${id}.${ext}`,
            bucket: 'unstock-admin',
        });

        const query = `UPDATE bill_payment SET src=$1
        WHERE id=$2;`;
        const values = [result.url, params.payment_id];

        const { rows } = await runQuery(query, values);

        // const billInfo = `SELECT bill_id FROM bill_payment
        // WHERE id=$1;`;
        // const billInfoValues = [params.payment_id];

        return rows;
    }

    // async AddBillImage2(params: AddPaymentImageParams): Promise<boolean> {
    //     try {
    //         const extensionRegex = /(?:\.([^.]+))?$/;
    //         const id = uuidv4();
    //         const ext = extensionRegex.exec(params.image.name)[1];

    //         const result = await this.fileService.uploadImages({
    //             filePath: params.image.path,
    //             key: `payments/${id}.${ext}`,
    //             bucket: 'unstock-admin',
    //         });

    //         const query = `UPDATE bill_payment
    //          SET src='${result.url}'
    //          WHERE id='${params.payment_id}';`;

    //         const billInfo = `SELECT bill_id FROM bill_payment
    //         WHERE id='${params.payment_id}';`;

    //         client = await this.pool.connect();

    //         const res = await client.query(query);

    //         const billId = await client.query(billInfo);

    //         const updateBill = `UPDATE store_bill
    //         SET status='paid'
    //         WHERE id='${billId.rows[0].bill_id}';`;

    //         await client.query(updateBill);

    //         client.release();

    //         return true;
    //     } catch (e) {
    //         if (!!client) {
    //             client.release();
    //         }
    //         throw e;
    //     }
    // }

    async get(storeId: string): Promise<Bill[]> {
        const query = `SELECT * FROM store_bill WHERE store_id = $1`;
        const values = [storeId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows.map(mapBill) : null;
    }

    async GetBillItems(billId: string): Promise<Items[]> {
        const query = `SELECT * FROM store_bill_item WHERE bill_id = $1`;
        const values = [billId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows : null;
    }

    async AddBillPayment(params: AddPaymentParams): Promise<BillPayment> {
        const { bill_id, type, amount } = params;
        const query = `INSERT INTO bill_payment (bill_id, type, amount)
        VALUES ($1, $2, $3) returning *;`;
        const values = [bill_id, type, amount];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows[0] : null;
    }

    async GetBillPayments(billId: string): Promise<BillPayment[]> {
        const query = `SELECT * FROM bill_payment WHERE bill_id = $1`;
        const values = [billId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows : null;
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
