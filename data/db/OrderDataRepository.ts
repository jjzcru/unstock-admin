import { runQuery } from './db';
import { OrderRepository } from '@domain/repository/OrderRepository';
import { Order, Address } from '@domain/model/Order';

export default class OrderDataRepository implements OrderRepository {
    async MarkAsPaid(storeId: string, orderId: string): Promise<Order> {
        const query = `UPDATE store_order
        SET financial_status='paid'
        WHERE id=$1 and store_id= $2 RETURNING  *;
        `;
        const values = [orderId, storeId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            for (const row of rows) {
                return mapRowToOrder(row);
            }
        }
    }

    async getByStatus(
        storeId: string,
        status: 'open' | 'closed' | 'cancelled' | 'any'
    ): Promise<Order[]> {
        const query = `SELECT * FROM store_order 
        WHERE store_id='${storeId}' 
        ${status !== 'any' ? `AND status = $2` : ''}
        ORDER BY created_at DESC;`;
        const values = [storeId, status];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows.map(mapRowToOrder);
        }
        return null;
    }

    async getById(storeId: string, orderId: string): Promise<Order> {
        const query = `SELECT * FROM store_order 
        WHERE store_id=$1 AND id = $2`;
        const values = [storeId, orderId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows.map(mapRowToOrder);
        }
        return null;
    }

    async getProductItems(orderId: string): Promise<any[]> {
        const query = `SELECT * FROM store_order_item 
        WHERE order_id = $1`;
        const values = [orderId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows;
        }
        return null;
    }

    async close(storeId: string, orderId: string): Promise<Order> {
        const query = `UPDATE store_order 
        SET status = 'closed', 
        fulfillment_status = 'fulfilled',
        financial_status = 'paid',
        closed_at = NOW() 
        WHERE id = $1 AND store_id = $2 RETURNING *;`;
        const values = [orderId, storeId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            for (const row of rows) {
                return mapRowToOrder(row);
            }
        }
        return null;
    }

    async cancel(storeId: string, orderId: string): Promise<Order> {
        const query = `UPDATE store_order 
        SET status = 'cancelled', 
        fulfillment_status = 'fulfilled',
        cancelled_at = NOW() 
        WHERE id = $1AND store_id = $2 RETURNING *;`;

        const values = [orderId, storeId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            for (const row of rows) {
                return mapRowToOrder(row);
            }
        }
        return null;
    }
    async delete(storeId: string, orderId: string): Promise<Order> {
        const query = `DELETE FROM store_order 
        WHERE id = $1 AND store_id = $2 RETURNING *;`;

        const values = [orderId, storeId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            for (const row of rows) {
                return mapRowToOrder(row);
            }
        }
        return null;
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
        order_number,
        costumer,
        payment_method,
        shipping_option,
        pickup_location,
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
        orderNumber: order_number,
        costumer,
        paymentMethod: payment_method,
        pickupLocation: pickup_location,
        shippingOption: shipping_option,
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
