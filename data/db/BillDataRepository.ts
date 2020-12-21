import { runQuery } from './db';
import { Bill, BillPayment, Items } from '@domain/model/Bill';
import {
    BillRepository,
    AddPaymentParams,
    AddPaymentImageParams,
} from '@domain/repository/BillRepository';
import FileService from '@data/services/FileServices';
import { v4 as uuidv4 } from 'uuid';

export default class BillDataRepository implements BillRepository {
    private fileService: FileService;
    constructor() {
        this.fileService = new FileService();
    }

    async addBillImage(params: AddPaymentImageParams): Promise<boolean> {
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

        return rows;
    }

    async get(storeId: string): Promise<Bill[]> {
        const query = `SELECT * FROM store_bill WHERE store_id = $1`;
        const values = [storeId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows.map(mapBill) : null;
    }

    async getBillItems(billId: string): Promise<Items[]> {
        const query = `SELECT * FROM store_bill_item WHERE bill_id = $1`;
        const values = [billId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows : null;
    }

    async addBillPayment(params: AddPaymentParams): Promise<BillPayment> {
        const { bill_id, type, amount } = params;
        const query = `INSERT INTO bill_payment (bill_id, type, amount)
        VALUES ($1, $2, $3) returning *;`;
        const values = [bill_id, type, amount];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows[0] : null;
    }

    async getBillPayments(billId: string): Promise<BillPayment[]> {
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
