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

        return rows && rows.length ? mapRowToOrder(rows[0]) : null;
    }

    async getByStatus(
        storeId: string,
        status: 'open' | 'closed' | 'cancelled' | 'any'
    ): Promise<Order[]> {
        let query = `SELECT * FROM store_order 
        WHERE store_id=$1
        ORDER BY created_at DESC;`;
        const values = [storeId];

        if (status !== 'any') {
            query = `SELECT * FROM store_order 
            WHERE store_id=$1
            AND status = $2
            ORDER BY created_at DESC;`;
            values.push(status);
        }

        const { rows } = await runQuery(query, values);

        return rows.map(mapRowToOrder);
    }

    async getById(storeId: string, orderId: string): Promise<Order> {
        const query = `SELECT * FROM store_order 
        WHERE store_id=$1 AND id = $2`;
        const values = [storeId, orderId];
        const { rows } = await runQuery(query, values);

        return rows && rows.length ? mapRowToOrder(rows[0]) : null;
    }

    async getProductItems(orderId: string): Promise<any[]> {
        const query = `SELECT * FROM store_order_item 
        WHERE order_id = $1`;
        const values = [orderId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows;
        }
        return [];
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

        return rows && rows.length ? mapRowToOrder(rows[0]) : null;
    }

    async cancel(storeId: string, orderId: string): Promise<Order> {
        const query = `UPDATE store_order 
        SET status = 'cancelled', 
        fulfillment_status = 'fulfilled',
        cancelled_at = NOW() 
        WHERE id = $1AND store_id = $2 RETURNING *;`;

        const values = [orderId, storeId];
        const { rows } = await runQuery(query, values);

        return rows && rows.length ? mapRowToOrder(rows[0]) : null;
    }
    async delete(storeId: string, orderId: string): Promise<Order> {
        const query = `DELETE FROM store_order 
        WHERE id = $1 AND store_id = $2 RETURNING *;`;

        const values = [orderId, storeId];
        const { rows } = await runQuery(query, values);

        return rows && rows.length ? mapRowToOrder(rows[0]) : null;
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
        shipping_location,
    } = row;
    console.log(address);

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
        shippingLocation: shipping_location,
    };
}

function mapAddress(address: any): Address {
    if (!address) {
        return null;
    }

    const {
        address_1,
        address_2,
        city,
        province,
        delivery_instructions,
    } = address;

    return {
        address1: address_1,
        address2: address_2,
        city,
        province,
        deliveryInstructions: delivery_instructions,
    };
}
