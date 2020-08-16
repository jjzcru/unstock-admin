import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { OrderRepository } from '@domain/repository/OrderRepository';
import { Order, Address } from '@domain/model/Order';

export default class OrderDataRepository implements OrderRepository {
    private pool: Pool;
    constructor() {
        this.pool = getConnection();
    }

    async getByStatus(
        storeId: string,
        status: 'open' | 'closed' | 'cancelled' | 'any'
    ): Promise<Order[]> {
        let client: PoolClient;

        const query = `SELECT * FROM order 
        WHERE store_id='${storeId}' 
        ${status !== 'any' ? `AND status = '${status}'` : ''};`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            return res.rows.map(this.mapRowToOrder);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async getById(storeId: string, orderId: string): Promise<Order> {
        let client: PoolClient;

        const query = `SELECT * FROM order 
        WHERE store_id='${storeId}' AND order_id = '${orderId}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return this.mapRowToOrder(row);
            }
            return null;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
    async close(storeId: string, orderId: string): Promise<Order> {
        let client: PoolClient;
        const query = `UPDATE order 
        SET status = 'closed', closed_at = NOW() 
        WHERE id = '${orderId}' AND store_id = '${storeId}' RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return this.mapRowToOrder(row);
            }

            return null;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
    async cancel(storeId: string, orderId: string): Promise<Order> {
        let client: PoolClient;
        const query = `UPDATE order 
        SET status = 'cancelled', cancelled_at = NOW() 
        WHERE id = '${orderId}' AND store_id = '${storeId}' RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return this.mapRowToOrder(row);
            }

            return null;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
    async delete(storeId: string, orderId: string): Promise<Order> {
        let client: PoolClient;
        const query = `DELETE FROM order 
        WHERE id = '${orderId}' AND store_id = '${storeId}' RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return this.mapRowToOrder(row);
            }

            return null;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    private mapRowToOrder(row: any): Order {
        const {
            id,
            store_id,
            checkout_id,
            shipping_type,
            total,
            sub_total,
            fullfillment_status,
            financial_status,
            status,
            tax,
            email,
            address,
            message,
            created_at,
            updated_at,
            closed_at,
            cancelled_at,
            cancel_reason,
        } = row;

        return {
            id,
            storeId: store_id,
            checkoutId: checkout_id,
            total,
            subTotal: sub_total,
            shippingType: shipping_type,
            fullfillmentStatus: fullfillment_status,
            financialStatus: financial_status,
            tax,
            email,
            address: this.mapAddress(address),
            status,
            message,
            createdAt: created_at,
            updatedAt: updated_at,
            closedAt: closed_at,
            cancelledAt: cancelled_at,
            cancelReason: cancel_reason,
        };
    }

    private mapAddress(address: any): Address {
        const {
            id,
            firstName,
            lastName,
            addressOptional,
            postalCode,
            mapAddress,
        } = address;

        const { latitude, longitude } = mapAddress;

        return {
            id,
            firstName,
            lastName,
            address: address.address,
            addressOptional,
            postalCode,
            mapAddress: {
                latitude,
                longitude,
            },
        };
    }
}
