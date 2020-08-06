import {
    CostumerRepository,
    CreateParams,
} from '../../../../domain/repository/CostumerRepository';

import { Costumer } from '../../../../domain/model/Costumer';

export class TestCostumerRepository implements CostumerRepository {
    private costumers: Costumer[];

    constructor() {
        this.costumers = [];
    }

    async get(id: string): Promise<Costumer> {
        for (const costumer of this.costumers) {
            if (costumer.id === id) {
                return costumer;
            }
        }

        return null;
    }

    async add(params: CreateParams): Promise<Costumer> {
        const id: string = `${this.costumers.length + 1}`;
        const { name, email, password } = params;

        const costumer: Costumer = {
            id,
            name,
            password,
            email,
        };

        this.costumers.push(costumer);
        return costumer;
    }
}
