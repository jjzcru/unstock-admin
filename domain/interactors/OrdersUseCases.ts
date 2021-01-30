import { UseCase } from './UseCase';
import { OrderRepository } from '../repository/OrderRepository';
import { ProductRepository } from '../repository/ProductRepository';
import { Order, OrderInput, OrderItem } from '../model/Order';
import { Variant } from '../model/Product';
import OrderDataRepository from '@data/db/OrderDataRepository';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { throwError } from '@errors';
import { EmailService } from '../service/EmailService';

import { EmailDataService } from '@data/services/EmailDataService';
import { EmailTemplateDataService } from '@data/services/EmailTemplateDataService';

import {
    EmailTemplateService,
    NotificationOrderParams,
} from '../service/EmailTemplateService';

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
    private productRepository: ProductDataRepository;

    private order: Order;
    private recipients: string[];
    private orderInput: OrderInput;
    private variants: Variant[];
    private emailService: EmailService;
    private emailTemplateService: EmailTemplateService;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository(),
        productRepository: ProductDataRepository = new ProductDataRepository(),
        emailsService: EmailService = new EmailDataService(),
        emailTemplateService: EmailTemplateService = new EmailTemplateDataService()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.emailService = emailsService;
        this.emailTemplateService = emailTemplateService;
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

    // async sendStoreEmailNotification(): Promise<void> {
    //     const locale = new Locale(this.lang);
    //     const params = await this.getStoreEmailParams();
    //     const subject = locale.getKey('NEW_ORDER_SUBJECT');
    //     const body = await this.getStoreEmailBody(params);
    //     await this.emailService.sendEmail({
    //         email: this.recipients,
    //         subject,
    //         body,
    //     });
    // }

    // async getStoreEmailParams(): Promise<NotificationOrderParams> {
    //     const { id, orderNumber } = this.order;
    //     const {
    //         costumer,
    //         shippingType,
    //         address,
    //         location,
    //         items,
    //     } = this.orderInput;

    //     let total = 0;
    //     const variantMap = new Map<string, Variant>();
    //     for (const variant of this.variants) {
    //         variantMap.set(variant.id, variant);
    //     }

    //     const amountMap: Map<string, number> = new Map();
    //     for (const item of items) {
    //         total += variantMap.get(item.id).price * item.quantity;
    //         amountMap.set(item.id, item.quantity);
    //     }

    //     const products = await this.productRepository.getByIDs(
    //         this.orderInput.storeId,
    //         this.items.map((item) => item.productId)
    //     );

    //     const productMap = new Map<string, Product>();
    //     for (const product of products) {
    //         productMap.set(product.id, product);
    //     }

    //     return {
    //         orderId: id,
    //         orderNumber,
    //         lang: this.lang,
    //         costumer,
    //         shippingType,
    //         address,
    //         location,
    //         pickupLocation: this.pickupLocation,
    //         paymentMethod: this.paymentMethod,
    //         total,
    //         items: this.items.map((item) => {
    //             const { productId, variantId } = item;
    //             const product = productMap.get(productId);
    //             const variant = variantMap.get(variantId);
    //             return {
    //                 name: product?.name,
    //                 option1: variant?.option1,
    //                 option2: variant?.option2,
    //                 option3: variant?.option3,
    //                 quantity: amountMap.get(variantId),
    //                 total: variant.price * amountMap.get(variantId),
    //             };
    //         }),
    //     };
    // }
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
