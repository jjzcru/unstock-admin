import { Order, OrderParams } from '../model/Order';

export interface OrderRepository {
    getByStatus(
        storeId: string,
        status: 'open' | 'closed' | 'cancelled' | 'any'
    ): Promise<Order[]>;
    getById(storeId: string, orderId: string): Promise<Order>;
    getProductItems(orderId: string): Promise<any[]>;
    close(storeId: string, orderId: string): Promise<Order>;
    cancel(storeId: string, orderId: string): Promise<Order>;
    delete(storeId: string, orderId: string): Promise<Order>;
    MarkAsPaid(storeId: string, orderId: string): Promise<Order>;
    createOrder(storeId: string, params: OrderParams): Promise<Order>;
}
