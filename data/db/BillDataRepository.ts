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
    private imagePrefix: string;
    private bucketName: string;
    constructor() {
        this.fileService = new FileService();
        this.imagePrefix =
            process.env.APP_ENV === 'production'
                ? 'https://cdn.unstock.shop'
                : 'https://cdn.dev.unstock.shop';

        this.bucketName =
            process.env.APP_ENV === 'production'
                ? 'cdn.unstock.shop'
                : 'cdn.dev.unstock.shop';
    }

    async addBillImage(params: AddPaymentImageParams): Promise<boolean> {
        const { payment_id, image, storeId } = params;
        const extensionRegex = /(?:\.([^.]+))?$/;
        const id = uuidv4();
        const ext = extensionRegex.exec(image.name)[1];

        const result = await this.fileService.uploadImages({
            filePath: image.path,
            key: `${storeId}/payments/${id}.${ext}`,
            bucket: this.bucketName,
        });
        const query = `UPDATE bill_payment SET src=$1
        WHERE id=$2 RETURNING *;`;
        const values = [result.url, payment_id];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            await this.payBill(rows[0].bill_id);
            return true;
        } else {
            return false;
        }
    }

    async payBill(billId: string): Promise<BillPayment[]> {
        const query = `UPDATE store_bill SET status='paid'
        WHERE id=$1 RETURNING *;`;
        const values = [billId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows[0] : null;
    }

    async get(storeId: string): Promise<Bill[]> {
        const query = `SELECT * FROM store_bill WHERE store_id = $1`;
        const values = [storeId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows.map(mapBill) : [];
    }

    async getBillItems(billId: string): Promise<Items[]> {
        const query = `SELECT * FROM store_bill_item WHERE bill_id = $1`;
        const values = [billId];

        const { rows } = await runQuery(query, values);
        console.log(rows);
        return rows && rows.length ? rows : [];
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
        return rows && rows.length ? rows : [];
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
