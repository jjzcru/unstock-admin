import { UseCase } from './UseCase';
import { PaymentMethodRepository } from '../repository/PaymentMethodRepository';
import { PaymentMethod } from '../model/PaymentMethod';
import PaymentMethodDataRepository from '@data/db/PaymentMethodDataRepository';
import { throwError } from '@errors';

export class GetPaymentMethods implements UseCase {
    private storeId: string;
    PaymentMethodRepository: PaymentMethodRepository;

    constructor(
        storeId: string,
        repository: PaymentMethodRepository = new PaymentMethodDataRepository()
    ) {
        this.storeId = storeId;
        this.PaymentMethodRepository = repository;
    }
    async execute(): Promise<PaymentMethod[]> {
        const methods = await this.PaymentMethodRepository.get(this.storeId);
        return methods;
    }
}

export class AddPaymentMethods implements UseCase {
    private params: AddPaymentMethodParams;
    PaymentMethodRepository: PaymentMethodRepository;

    constructor(
        params: AddPaymentMethodParams,
        repository: PaymentMethodRepository = new PaymentMethodDataRepository()
    ) {
        this.params = params;
        this.PaymentMethodRepository = repository;
    }
    async execute(): Promise<PaymentMethod> {
        const method = await this.PaymentMethodRepository.add(
            this.params,
            this.params.storeId
        );
        return method;
    }
}

export interface AddPaymentMethodParams {
    storeId?: string;
    name?: string;
    type?:
        | 'bank_deposit'
        | 'cash'
        | 'cash_on_delivery'
        | 'custom'
        | 'external_credit'
        | 'external_debit'
        | 'gift_card'
        | 'money_order'
        | 'store_credit'
        | 'credit_card'
        | 'debit_card'
        | 'providers';
    aditionalDetails?: string;
    paymentInstructions?: string;
}

export class UpdatePaymentMethods implements UseCase {
    private params: UpdatePaymentMethodParams;
    PaymentMethodRepository: PaymentMethodRepository;

    constructor(
        params: UpdatePaymentMethodParams,
        repository: PaymentMethodRepository = new PaymentMethodDataRepository()
    ) {
        this.params = params;
        this.PaymentMethodRepository = repository;
    }
    async execute(): Promise<PaymentMethod> {
        const method = await this.PaymentMethodRepository.update(
            this.params.id,
            this.params
        );
        return method;
    }
}

export interface UpdatePaymentMethodParams {
    id?: string;
    name?: string;
    type?:
        | 'bank_deposit'
        | 'cash'
        | 'cash_on_delivery'
        | 'custom'
        | 'external_credit'
        | 'external_debit'
        | 'gift_card'
        | 'money_order'
        | 'store_credit'
        | 'credit_card'
        | 'debit_card'
        | 'providers';
    aditionalDetails?: string;
    paymentInstructions?: string;
    enabled?: boolean;
}

export class DeletePaymentMethods implements UseCase {
    private storeId: string;
    private id: string;
    PaymentMethodRepository: PaymentMethodRepository;

    constructor(
        storeId: string,
        id: string,
        repository: PaymentMethodRepository = new PaymentMethodDataRepository()
    ) {
        this.storeId = storeId;
        this.id = storeId;
        this.PaymentMethodRepository = repository;
    }
    async execute(): Promise<PaymentMethod> {
        const method = await this.PaymentMethodRepository.delete(
            this.id,
            this.storeId
        );
        return method;
    }
}
