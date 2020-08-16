import { UseCase } from './UseCase';
import { OrderRepository } from '../repository/OrderRepository';
import { Order } from '../model/Order';
import OrderDataRepository from '@data/db/OrderDataRepository';
import { throwError } from '@errors';

export class GetOrders implements UseCase {
    private params: GetOrdersParams;
    private orderRepository: OrderRepository;

    constructor(
        params: GetOrdersParams,
        orderRepository: OrderRepository = new OrderDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
    }

    async execute(): Promise<Order[]> {
        const { storeId, status } = this.params;
        return this.orderRepository.getByStatus(storeId, status);
    }
}

interface GetOrdersParams {
    storeId: string;
    status: 'open' | 'closed' | 'cancelled' | 'any';
}

interface OrderIdParam {
    storeId: string;
    orderId: string;
}

export class GetOrder implements UseCase {
    private params: OrderIdParam;
    private orderRepository: OrderRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository()
    ) {
        this.params = params;

        this.orderRepository = orderRepository;
    }

    async execute(): Promise<Order> {
        const { storeId, orderId } = this.params;
        const order = await this.orderRepository.getById(storeId, orderId);
        if (!order) {
            throwError('ORDER_NOT_FOUND');
        }
        return order;
    }
}

export class CloseOrder implements UseCase {
    private params: OrderIdParam;
    private orderRepository: OrderRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
    }

    async execute(): Promise<Order> {
        const { storeId, orderId } = this.params;
        const order = await this.orderRepository.getById(storeId, orderId);
        if (!order) {
            throwError('ORDER_NOT_FOUND');
        }

        const { status } = order;

        if (status !== 'open') {
            throwError('ORDER_OPERATION_NOT_PERMITTED', {
                message: 'Only open orders can be closed',
            });
        }

        return this.orderRepository.close(storeId, orderId);
    }
}

export class CancelOrder implements UseCase {
    private params: OrderIdParam;
    private orderRepository: OrderRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
    }

    async execute(): Promise<Order> {
        const { storeId, orderId } = this.params;
        const order = await this.orderRepository.getById(storeId, orderId);
        if (!order) {
            throwError('ORDER_NOT_FOUND');
        }

        const { status } = order;

        if (status === 'cancelled') {
            throwError('ORDER_OPERATION_NOT_PERMITTED', {
                message: 'Order was already cancelled',
            });
        }

        return this.orderRepository.cancel(storeId, orderId);
    }
}

export class DeleteOrder implements UseCase {
    private params: OrderIdParam;
    private orderRepository: OrderRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
    }

    async execute(): Promise<Order> {
        const { storeId, orderId } = this.params;
        const order = await this.orderRepository.delete(storeId, orderId);
        if (!order) {
            throwError('ORDER_NOT_FOUND');
        }
        return order;
    }
}
