import { UseCase } from './UseCase';
import { OrderRepository } from '../repository/OrderRepository';
import { StoreRepository } from '../repository/StoreRepository';
import { ProductRepository } from '../repository/ProductRepository';
import { Order, OrderInput, OrderItem } from '../model/Order';
import { Variant } from '../model/Product';
import OrderDataRepository from '@data/db/OrderDataRepository';
import StoreDataRepository from '@data/db/StoreDataRepository';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { throwError } from '@errors';
import { EmailService } from '../service/EmailService';

import { EmailDataService } from '@data/services/EmailDataService';
import { EmailTemplateDataService } from '@data/services/EmailTemplateDataService';

import { EmailTemplateService } from '../service/EmailTemplateService';

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
    private storeRepository: StoreRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository(),
        productRepository: ProductDataRepository = new ProductDataRepository(),
        emailsService: EmailService = new EmailDataService(),
        emailTemplateService: EmailTemplateService = new EmailTemplateDataService(),
        storeRepository: StoreRepository = new StoreDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.emailService = emailsService;
        this.emailTemplateService = emailTemplateService;
        this.storeRepository = storeRepository;
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
        const store = await this.storeRepository.getStoreById(storeId);
        await this.sendCloseOrderEmail(order, store);
        return this.orderRepository.close(storeId, orderId);
    }

    async sendCloseOrderEmail(order, store): Promise<void> {
        const { orderNumber, costumer } = order;
        const { domain } = store;

        const renderEmail = await this.emailTemplateService.closeOrderTemplate({
            lang: 'es',
            name: `${costumer.firstName} ${costumer.lastName}`,
            order: orderNumber,
            theme: null,
            domain,
        });

        await this.emailService.sendEmail({
            email: 'josejuan2412@gmail.com', // costumer.email,
            subject: `Actualización de Orden: #${orderNumber}`,
            body: renderEmail,
        });
    }
}

export class CancelOrder implements UseCase {
    private params: OrderIdParam;
    private orderRepository: OrderRepository;
    private productRepository: ProductRepository;
    private emailService: EmailService;
    private emailTemplateService: EmailTemplateService;
    private storeRepository: StoreRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository(),
        productRepository: ProductRepository = new ProductDataRepository(),
        emailsService: EmailService = new EmailDataService(),
        emailTemplateService: EmailTemplateService = new EmailTemplateDataService(),
        storeRepository: StoreRepository = new StoreDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.emailService = emailsService;
        this.emailTemplateService = emailTemplateService;
        this.storeRepository = storeRepository;
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
        // const cancellation = this.orderRepository.cancel(storeId, orderId);
        const items = await this.orderRepository.getProductItems(order.id);
        for (const item of items) {
            const variantInfo = await this.productRepository.getVariantById(
                item.variant_id
            );
            console.log(variantInfo);
            const { id, quantity, productId } = variantInfo;
            const total = quantity + item.quantity;
            this.productRepository.updateVariantInventory(id, total);
            item.product = await this.productRepository.getByID(
                productId,
                storeId
            );
        }
        const store = await this.storeRepository.getStoreById(storeId);

        // items = items.map(async (item) => {
        //     item.product = await this.productRepository.getByID(
        //         item.id,
        //         storeId
        //     );
        //     return item;
        // });

        console.log(items);
        order.items = items;
        await this.sendCancelledOrderEmail(order, store);

        return order;
    }

    async sendCancelledOrderEmail(order, store): Promise<void> {
        const {
            orderNumber,
            costumer,
            address,
            items,
            total,
            paymentMethod,
            shippingType,
        } = order;
        const { domain } = store;
        const renderEmail = await this.emailTemplateService.cancelledOrderTemplate(
            {
                lang: 'es',
                orderNumber,
                costumer,
                address,
                items,
                total,
                paymentMethod,
                shippingType,
            }
        );

        console.log({
            lang: 'es',
            orderNumber,
            costumer,
            address,
            items,
            total,
            paymentMethod,
            shippingType,
        });

        await this.emailService.sendEmail({
            email: 'josejuan2412@gmail.com', // costumer.email,
            subject: `Orden cancelada: #${orderNumber}`,
            body: renderEmail,
        });
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
    private emailService: EmailService;
    private emailTemplateService: EmailTemplateService;
    private storeRepository: StoreRepository;

    constructor(
        params: OrderIdParam,
        orderRepository: OrderRepository = new OrderDataRepository(),
        emailsService: EmailService = new EmailDataService(),
        emailTemplateService: EmailTemplateService = new EmailTemplateDataService(),
        storeRepository: StoreRepository = new StoreDataRepository()
    ) {
        this.params = params;
        this.orderRepository = orderRepository;
        this.emailService = emailsService;
        this.emailTemplateService = emailTemplateService;
        this.storeRepository = storeRepository;
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
        const store = await this.storeRepository.getStoreById(storeId);
        await this.sendPaidOrderEmail(order, store);
        return order;
    }

    async sendPaidOrderEmail(order, store): Promise<void> {
        const { orderNumber, costumer } = order;
        const { domain } = store;

        const renderEmail = await this.emailTemplateService.markAsPaidTemplate({
            lang: 'es',
            name: `${costumer.firstName} ${costumer.lastName}`,
            order: orderNumber,
            theme: null,
            domain,
        });

        await this.emailService.sendEmail({
            email: 'josejuan2412@gmail.com', // costumer.email,
            subject: `Actualización de Orden: #${orderNumber}`,
            body: renderEmail,
        });
    }
}
