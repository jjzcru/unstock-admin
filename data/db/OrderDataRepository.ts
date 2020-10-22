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

        const query = `SELECT * FROM store_order 
        WHERE store_id='${storeId}' 
        ${status !== 'any' ? `AND status = '${status}'` : ''}
        ORDER BY created_at DESC;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            return res.rows.map(mapRowToOrder);
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
        }
    }

    async getById(storeId: string, orderId: string): Promise<Order> {
        let client: PoolClient;

        const query = `SELECT * FROM store_order 
        WHERE store_id='${storeId}' AND id = '${orderId}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return mapRowToOrder(row);
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
        const query = `UPDATE store_order 
        SET status = 'closed', 
        fulfillment_status = 'fulfilled',
        financial_status = 'paid',
        closed_at = NOW() 
        WHERE id = '${orderId}' AND store_id = '${storeId}' RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return mapRowToOrder(row);
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
        const query = `UPDATE store_order 
        SET status = 'cancelled', 
        fulfillment_status = 'fulfilled',
        cancelled_at = NOW() 
        WHERE id = '${orderId}' AND store_id = '${storeId}' RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return mapRowToOrder(row);
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
        const query = `DELETE FROM store_order 
        WHERE id = '${orderId}' AND store_id = '${storeId}' RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                return mapRowToOrder(row);
            }

            return null;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
}

function mapRowToOrder(row: any): Order {
    const {
        id,
        store_id,
        checkout_id,
        shipping_type,
        currency,
        total,
        sub_total,
        fulfillment_status,
        financial_status,
        status,
        tax,
        email,
        phone,
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
        total: parseFloat(`${total}`),
        currency,
        subtotal: parseFloat(`${sub_total}`),
        shippingType: shipping_type,
        fulfillmentStatus: fulfillment_status,
        financialStatus: financial_status,
        tax: parseFloat(`${tax}`),
        email,
        phone,
        address: mapAddress(address),
        status,
        message,
        createdAt: created_at,
        updatedAt: updated_at,
        closedAt: closed_at,
        cancelledAt: cancelled_at,
        cancelReason: cancel_reason,
    };
}

function mapAddress(address: any): Address {
    if (!address) {
        return null;
    }

    const {
        id,
        first_name,
        last_name,
        address_optional,
        postal_code,
        location,
    } = address;

    let latitude: number;
    let longitude: number;

    if (!!location) {
        latitude = location.latitude;
        longitude = location.longitude;
    }

    return {
        id,
        firstName: first_name,
        lastName: last_name,
        address: address.address,
        addressOptional: address_optional,
        postalCode: postal_code,
        location: {
            latitude,
            longitude,
        },
    };
}
