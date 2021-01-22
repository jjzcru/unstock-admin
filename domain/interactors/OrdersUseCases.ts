import { UseCase } from './UseCase';
import { OrderRepository } from '../repository/OrderRepository';
import { ProductRepository } from '../repository/ProductRepository';
import { Order } from '../model/Order';
import OrderDataRepository from '@data/db/OrderDataRepository';
import ProductDataRepository from '@data/db/ProductDataRepository';
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
    private productRepository: ProductRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository(),
        productRepository: ProductRepository = new ProductDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    async execute(): Promise<Order> {
        const { storeId, orderId } = this.params;
        const order = await this.orderRepository.getById(storeId, orderId);
        if (!order) {
            throwError('ORDER_NOT_FOUND');
        }
        order.items = [];
        const items = await this.orderRepository.getProductItems(order.id);

        for (const item of items) {
            const variantInfo = await this.productRepository.getVariantById(
                item.variant_id
            );

            const product = await this.productRepository.getByID(
                variantInfo.productId,
                storeId
            );

            const images = await this.productRepository.getVariantsImages(
                item.variant_id
            );

            if (images.length) {
                variantInfo.images.push(
                    await this.productRepository.getImageByID(
                        images[0].productImageId
                    )
                );
            } else {
                variantInfo.images.push(
                    await this.productRepository.getThumbnail(product.id)
                );
            }

            order.items.push({
                id: item.id,
                variantId: item.variant_id,
                product,
                orderId,
                shipmentId: '',
                quantity: item.quantity,
                variant: variantInfo,
            });
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
    private productRepository: ProductRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository(),
        productRepository: ProductRepository = new ProductDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
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
        const cancellation = this.orderRepository.cancel(storeId, orderId);
        const items = await this.orderRepository.getProductItems(order.id);
        for (const item of items) {
            const variantInfo = await this.productRepository.getVariantById(
                item.variant_id
            );
            const { id, quantity } = variantInfo;
            const total = quantity + item.quantity;
            this.productRepository.updateVariantInventory(id, total);
        }
        return cancellation;
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

export class PaidOrder implements UseCase {
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
        const orderStatus = await this.orderRepository.getById(
            storeId,
            orderId
        );
        if (!orderStatus) {
            throwError('ORDER_NOT_FOUND');
        }
        const { financialStatus } = orderStatus;
        if (financialStatus === 'paid') {
            throwError('ORDER_OPERATION_NOT_PERMITTED', {
                message: 'Order was already paid',
            });
        }
        const order = await this.orderRepository.MarkAsPaid(storeId, orderId);
        return order;
    }
}
