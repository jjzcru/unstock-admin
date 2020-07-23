import { UseCase } from './UseCase';
import { CostumerRepository } from '../repository/CostumerRepository';
import { Costumer } from '../model/Costumer';

export class AddCostumer implements UseCase {
	private params: AddCostumerParams;
	private costumerRepository: CostumerRepository;

	constructor(params: AddCostumerParams, repository: CostumerRepository) {
		this.params = params;
		this.costumerRepository = repository;
	}

	async execute(): Promise<Costumer> {
		const { name, email, password } = this.params;

		return this.costumerRepository.add({
			name,
			email,
			password,
		});
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
		return this.costumerRepository.get(this.id);
	}
}

interface AddCostumerParams {
	name: string;
	email: string;
	password: string;
}
