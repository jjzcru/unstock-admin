import { UseCase } from './UseCase';
import {
    DraftRepository,
    DraftOrderItemParams,
} from '../repository/DraftRepository';
import { Draft, DraftOrderItem } from '../model/Draft';
import { Address } from '../model/Order';

import DraftDataRepository from '@data/db/DraftDataRepository';

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
        return this.draftRepository.getDraftsById(this.storeId, this.draftId);
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

        // agregamos los items
        if (items.length > 0) {
            // for (let index = 0; index < items.length; index++) {
            //     await this.draftRepository.addDraftItem(storeId, draft.id, {
            //         draftId: draft.id,
            //         variantId: items[index].variantId,
            //         price: items[index].price,
            //         sku: items[index].sku,
            //         quantity: items[index].quantity,
            //     });
            // }
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

        return this.draftRepository.updateDraft(this.draftId, {
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

        // actualizamos, creamos y eliminamos items
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
        return this.draftRepository.paidDraft(this.storeId, this.draftId);
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
