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
