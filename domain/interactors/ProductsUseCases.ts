import { UseCase } from './UseCase';
import { ProductRepository } from '../repository/ProductRepository';
import { Product, Image } from '../model/Product';
import ProductDataRepository from '../../data/db/ProductDataRepository';

export class AddProduct implements UseCase {
	private params: AddProductParams;
	private repository: ProductRepository;

	constructor(params: AddProductParams, repository: ProductRepository = new ProductDataRepository()) {
		this.params = params;
		this.repository = repository;
	}

	async execute(): Promise<Product> {
		const {
            storeId,
			name,
			body,
			tags,
			category,
			price,
			quantity,
			sku,
			barcode,
			vendor,
			inventoryPolicy
		} = this.params;

		const product = await this.repository.add({
            storeId,
			name,
			vendor,
			body,
			tags,
			category
		});

		const option = await this.repository.addOption({
			productId: product.id,
			name: 'Default'
		});

		const variant = await this.repository.addVariant({
			productId: product.id,
			sku,
			barcode,
			price,
			quantity,
			inventoryPolicy
		});

		product.variants = [variant];
		product.options = [option];

		return product;
	}
}

export interface AddProductParams {
    name: string;
    storeId: string;
	body: string;
	price: number;
	quantity: number;
	tags: string[];
	category?: string;
	sku?: string;
	barcode?: string;
	vendor?: string;
	inventoryPolicy: 'allow' | 'block';
}

export class AddProductImage implements UseCase {
	private params: AddImageParams;
	private repository: ProductRepository;

	constructor(params: AddImageParams, repository: ProductRepository) {
		this.params = params;
		this.repository = repository;
	}

	execute(): Promise<Image> {
		const {image, productId} = this.params;
		return this.repository.addImage({
			productId,
			image
		});
	}
}

export interface AddImageParams {
	image: string;
	productId: string;
}

export class UpdateProduct implements UseCase {
	execute(): Promise<any> {
		throw new Error("Method not implemented.");
	}

}

export class GetProducts implements UseCase {
	private productRepository: ProductRepository;

	constructor(repository: ProductRepository) {
		this.productRepository = repository;
	}
	async execute(): Promise<Product[]> {
		return this.productRepository.get();
	}
}

export class GetProductByID implements UseCase {
	private id: string;
	private productRepository: ProductRepository;

	constructor(id: string, repository: ProductRepository) {
		this.id = id;
		this.productRepository = repository;
	}
	async execute(): Promise<Product> {
		return this.productRepository.getByID(this.id);
	}
}

export class DeleteProduct implements UseCase {
    private id: string;
	private productRepository: ProductRepository;

	constructor(id: string, repository: ProductRepository) {
		this.id = id;
		this.productRepository = repository;
	}
	async execute(): Promise<Product> {
		return this.productRepository.delete(this.id);
	}
}