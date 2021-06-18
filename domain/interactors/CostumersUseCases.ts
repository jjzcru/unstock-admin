import { UseCase } from './UseCase';
import { CostumerRepository } from '../repository/CostumerRepository';
import { Costumer, CreateParams } from '../model/Costumer';
import { throwError } from '@errors';

import CostumerDataRepository from '@data/db/CostumerDataRepository';

export class AddCostumer implements UseCase {
    private params: CreateParams;
    private storeId: string;
    private costumerRepository: CostumerRepository;

    constructor(
        params: CreateParams,
        storeId: string,
        repository: CostumerRepository = new CostumerDataRepository()
    ) {
        this.params = params;
        this.storeId = storeId;
        this.costumerRepository = repository;
    }

    async execute(): Promise<Costumer> {
        console.log(this.params);
        const { firstName, lastName, email, phone } = this.params;
        const costumer = await this.costumerRepository.add({
            firstName,
            lastName,
            email,
            phone,
        });

        await this.costumerRepository.addStoreCostumer(
            this.storeId,
            costumer.id
        );

        return costumer;
    }
}

export class GetCostumerByID implements UseCase {
    private id: string;
    private costumerRepository: CostumerRepository;

    constructor(id: string, costumerRepository: CostumerRepository) {
        this.id = id;
        this.costumerRepository = costumerRepository;
    }

    async execute(): Promise<Costumer> {
        const consumer = this.costumerRepository.get(this.id);
        if (!consumer) {
            throwError('COSTUMER_NOT_FOUND');
        }

        return consumer;
    }
}

export class GetStoreCostumers implements UseCase {
    private storeId: string;
    private costumerRepository: CostumerRepository;

    constructor(
        storeId: string,
        costumerRepository: CostumerRepository = new CostumerDataRepository()
    ) {
        this.storeId = storeId;
        this.costumerRepository = costumerRepository;
    }

    async execute(): Promise<Costumer[]> {
        const costumers = await this.costumerRepository.getStoreCostumers(
            this.storeId
        );

        for (const key in costumers) {
            if (Object.prototype.hasOwnProperty.call(costumers, key)) {
                const id = costumers[key].id;
                costumers[key] = await this.costumerRepository.get(id);
            }
        }
        return costumers;
    }
}
