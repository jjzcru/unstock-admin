import { UseCase } from './UseCase';
import { DraftRepository } from '../repository/DraftRepository';
import { Draft } from '../model/Draft';
import { Address, Location, OrderItem } from '../model/Order';

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
        console.log(filters);
        console.log('in use case');
        return this.draftRepository.getDrafts(storeId, filters);
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

        return this.draftRepository.createDraft({
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
        });
    }
}

export class UpdateDraft implements UseCase {
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
        const id = '';
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

        return this.draftRepository.updateDraft(id, {
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
        });
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
    items?: OrderItem[];
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
