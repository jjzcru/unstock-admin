import {
    AddCostumer,
    GetCostumerByID,
} from '../../../domain/interactors/CostumersUseCases';
import { CostumerRepository } from '../../../domain/repository/CostumerRepository';
import { TestCostumerRepository } from './repository/TestCostumerRepository';
import { Costumer } from '../../../domain/model/Costumer';

describe('CostumersUseCases', () => {
    let costumerRepository: CostumerRepository;
    let id: string;
    let newCostumer: Costumer;
    beforeAll(() => {
        costumerRepository = new TestCostumerRepository();
    });
    describe('AddCostumer', () => {
        it('Should create a new costumer', async () => {
            const data = {
                name: 'John Doe',
                email: 'johndoe@test.com',
                password: '123456',
            };
            const useCase = new AddCostumer(data, costumerRepository);
            const costumer = await useCase.execute();

            newCostumer = costumer;

            id = costumer.id;
            expect(costumer.name).toBe(data.name);
            expect(costumer.email).toBe(data.email);
            expect(costumer.password).toBe(data.password);
        });
    });

    describe('GetCostumerByID', () => {
        it('Should get a costumer by id', async () => {
            const useCase = new GetCostumerByID(id, costumerRepository);
            const costumer = await useCase.execute();

            expect(costumer.id).toBe(id);
            expect(costumer).toEqual(newCostumer);
        });
    });
});
