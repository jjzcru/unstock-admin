import { UseCase } from './UseCase';
import {
    DraftRepository,
    DraftOrderItemParams,
} from '../repository/DraftRepository';

import { OrderRepository } from '../repository/OrderRepository';
import { Draft } from '../model/Draft';
import { Address, OrderParams } from '../model/Order';

import DraftDataRepository from '@data/db/DraftDataRepository';
import OrderDataRepository from '@data/db/OrderDataRepository';

import { ProductRepository } from '../repository/ProductRepository';
import ProductDataRepository from '@data/db/ProductDataRepository';
export class GetDrafts implements UseCase {
    private params: GetDraftParams;
    private draftRepository: DraftRepository;

    constructor(
        params: GetDraftParams,
        draftRepository: DraftRepository = new DraftDataRepository()
    ) {
        this.params = params;
        this.draftRepository = draftRepository;
    }

    async execute(): Promise<Draft[]> {
        const { storeId, filters } = this.params;
        return this.draftRepository.getDrafts(storeId, filters);
    }
}

export class GetDraftsById implements UseCase {
    private draftId: string;
    private storeId: string;
    private draftRepository: DraftRepository;
    private productRepository: ProductRepository;

    constructor(
        draftId: string,
        storeId: string,
        draftRepository: DraftRepository = new DraftDataRepository(),
        productRepository: ProductRepository = new ProductDataRepository()
    ) {
        this.draftId = draftId;
        this.storeId = storeId;
        this.draftRepository = draftRepository;
        this.productRepository = productRepository;
    }

    async execute(): Promise<Draft> {
        const draft = await this.draftRepository.getDraftsById(
            this.storeId,
            this.draftId
        );
        draft.items = await this.draftRepository.getDraftItems(this.draftId);
        for (const index in draft.items) {
            if (Object.prototype.hasOwnProperty.call(draft.items, index)) {
                draft.items[
                    index
                ].variant = await this.productRepository.getVariantById(
                    draft.items[index].variantId
                );

                const product = await this.productRepository.getByID(
                    draft.items[index].variant.productId,
                    this.storeId
                );
                draft.items[index].title = product.title;
            }
        }
        return draft;
    }
}

interface GetDraftParams {
    storeId: string;
    filters: string;
}

export class CreateDraft implements UseCase {
    private params: DraftParams;
    private draftRepository: DraftRepository;
    constructor(
        params: DraftParams,
        draftRepository: DraftRepository = new DraftDataRepository()
    ) {
        this.params = params;
        this.draftRepository = draftRepository;
    }

    async execute(): Promise<Draft> {
        const {
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            items,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        } = this.params;

        const draft = await this.draftRepository.createDraft({
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType: !!this.params.shippingType ? shippingType : null,
            status,
            message,
            pickupLocation: !!this.params.pickupLocation
                ? pickupLocation
                : null,
            paymentMethod: !!this.params.paymentMethod ? paymentMethod : null,
            shippingOption: !!this.params.shippingOption
                ? shippingOption
                : null,
            costumer: !!this.params.costumer ? costumer : null,
            shippingLocation: !!this.params.shippingLocation
                ? shippingLocation
                : null,
        });

        if (items.length > 0) {
            // for (let index = 0; index < items.length; index++) {
            //     await this.draftRepository.addDraftItem(storeId, draft.id, {
            //         id: null,
            //         draftId: draft.id,
            //         variantId: items[index].variantId,
            //         price: items[index].price,
            //         sku: items[index].sku,
            //         quantity: items[index].quantity,
            //     });
            // }

            for (const key in items) {
                if (Object.prototype.hasOwnProperty.call(items, key)) {
                    await this.draftRepository.addDraftItem(storeId, draft.id, {
                        id: null,
                        draftId: draft.id,
                        variantId: items[key].variantId,
                        price: items[key].price,
                        sku: items[key].sku,
                        quantity: items[key].quantity,
                    });
                }
            }
        }
        return draft;
    }
}

export class UpdateDraft implements UseCase {
    private params: DraftParams;
    private draftId: string;
    private draftRepository: DraftRepository;
    constructor(
        params: DraftParams,
        draftId: string,
        draftRepository: DraftRepository = new DraftDataRepository()
    ) {
        this.params = params;
        this.draftId = draftId;
        this.draftRepository = draftRepository;
    }

    async execute(): Promise<Draft> {
        const {
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            items,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        } = this.params;

        const draft = this.draftRepository.updateDraft(this.draftId, {
            storeId,
            address,
            subtotal,
            tax,
            total,
            currency,
            shippingType,
            status,
            message,
            pickupLocation,
            paymentMethod,
            shippingOption,
            costumer,
            shippingLocation,
        });

        if (items.length > 0) {
            for (const item in items) {
                if (items[item].id)
                    await this.draftRepository.removeDraftItem(
                        storeId,
                        this.draftId,
                        items[item].id
                    );
            }

            for (const key in items) {
                if (Object.prototype.hasOwnProperty.call(items, key)) {
                    await this.draftRepository.addDraftItem(
                        storeId,
                        this.draftId,
                        {
                            id: null,
                            draftId: this.draftId,
                            variantId: items[key].variantId,
                            price: items[key].price,
                            sku: items[key].sku,
                            quantity: items[key].quantity,
                        }
                    );
                }
            }
        }
        return draft;
    }
}

export class CancelDraft implements UseCase {
    private draftId: string;
    private storeId: string;
    private draftRepository: DraftRepository;
    constructor(
        draftId: string,
        storeId: string,
        draftRepository: DraftRepository = new DraftDataRepository()
    ) {
        this.draftId = draftId;
        this.storeId = storeId;
        this.draftRepository = draftRepository;
    }

    async execute(): Promise<Draft> {
        return this.draftRepository.cancelDraft(this.storeId, this.draftId);
    }
}

export class ArchiveDraft implements UseCase {
    private draftId: string;
    private storeId: string;
    private draftRepository: DraftRepository;
    constructor(
        draftId: string,
        storeId: string,
        draftRepository: DraftRepository = new DraftDataRepository()
    ) {
        this.draftId = draftId;
        this.storeId = storeId;
        this.draftRepository = draftRepository;
    }

    async execute(): Promise<Draft> {
        return this.draftRepository.archiveDraft(this.storeId, this.draftId);
    }
}

export class DraftToOrder implements UseCase {
    private draftId: string;
    private storeId: string;
    private draftRepository: DraftRepository;
    private orderRepository: OrderRepository;
    private productRepository: ProductRepository;

    constructor(
        draftId: string,
        storeId: string,
        draftRepository: DraftRepository = new DraftDataRepository(),
        orderRepository: OrderRepository = new OrderDataRepository(),
        productRepository: ProductRepository = new ProductDataRepository()
    ) {
        this.draftId = draftId;
        this.storeId = storeId;
        this.draftRepository = draftRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    async execute(): Promise<Draft> {
        const draft = await this.draftRepository.paidDraft(
            this.storeId,
            this.draftId
        );
        if (draft) {
            draft.items = await this.draftRepository.getDraftItems(
                this.draftId
            );
            for (const index in draft.items) {
                if (Object.prototype.hasOwnProperty.call(draft.items, index)) {
                    draft.items[
                        index
                    ].variant = await this.productRepository.getVariantById(
                        draft.items[index].variantId
                    );

                    const product = await this.productRepository.getByID(
                        draft.items[index].variant.productId,
                        this.storeId
                    );
                    draft.items[index].title = product.title;
                }
            }

            const params = {
                storeId: this.storeId,
                address: draft.address,
                subtotal: draft.subtotal,
                tax: draft.tax,
                total: draft.total,
                currency: draft.currency,
                financialStatus: null,
                fulfillmentStatus: null,
                shippingType: draft.shippingType,
                status: null,
                message: `created from draft: ${draft.draftNumber}`,
                pickupLocation: draft.pickupLocation,
                paymentMethod: draft.paymentMethod,
                shippingOption: draft.shippingOption,
                costumer: draft.costumer,
                shippingLocation: draft.shippingLocation,
            };
            const order = await this.orderRepository.createOrder(
                this.storeId,
                params
            );
            // order items

            for (const key in draft.items) {
                if (Object.prototype.hasOwnProperty.call(draft.items, key)) {
                    await this.orderRepository.addOrderItem(order.id, {
                        orderId: order.id,
                        variantId: draft.items[key].variantId,
                        price: draft.items[key].price,
                        sku: draft.items[key].sku,
                        quantity: draft.items[key].quantity,
                    });
                }
            }

            console.log(order);
        }

        return draft;
    }
}

interface DraftParams {
    storeId: string;
    address?: Address;
    subtotal?: number;
    tax?: number;
    total?: number;
    currency?: string;
    shippingType: 'pickup' | 'delivery' | 'shipment';
    status: 'open' | 'archived' | 'cancelled';
    items?: DraftOrderItemParams[];
    message?: string;
    createdAt?: Date;
    updatedAt?: Date;
    cancelledAt?: Date;
    pickupLocation?: any;
    shippingOption?: any;
    costumer?: any;
    shippingLocation?: any;
    cancelReason?: string;
    createdBy?: any;
    orderId?: string;
    paymentMethod?: any;
}
