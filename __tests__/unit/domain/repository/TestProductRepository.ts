import {
	ProductRepository,
	AddParams,
	UpdateParams,
	AddOptionParams,
	AddVariantParams,
	AddImageParams,
} from '../../../../domain/repository/ProductRepository';

import { Product, Option, Variant, Image } from '../../../../domain/model/Product';

export class TestProductRepository implements ProductRepository {
	private products: Product[] = [];
	private options: Option[] = [];
	private variants: Variant[] = [];
	private images: Image[] = [];

	async add(params: AddParams): Promise<Product> {
		const id = `${this.products.length + 1}`;
		const product: Product = {
			id,
			...params,
		};

		this.products.push(product);

		return product;
	}

	async get(): Promise<Product[]> {
		return this.products;
	}

	async getByID(id: string): Promise<Product> {
		for (const product of this.products) {
			if (product.id === id) {
				return product;
			}
		}
		return null;
	}

	async update(params: UpdateParams): Promise<Product> {
		for (let i = 0; i < this.products.length; i++) {
			let product = this.products[i];
			if (product.id === params.id) {
				product = {
					id: params.id,
					name: params.name ? params.name : product.name,
					body: params.body
						? params.body
						: product.body,
					created_at: product.created_at,
					updated_at: product.updated_at,
				};
				this.products[i] = product;
				return product;
			}
		}

		return null;
	}

	async delete(id: string): Promise<Product> {
		for (let i = 0; i < this.products.length; i++) {
			const product = this.products[i];
			if (product.id === id) {
				this.products.splice(i, 1);
				return product;
			}
		}

		return null;
	}

	async addOption(params: AddOptionParams): Promise<Option> {
		const id = `${this.options.length + 1}`;

		const { product_id, name } = params;

		let position = 1;
		for (const iterableOption of this.options) {
			if (iterableOption.product_id === product_id) {
				position += 1;
			}
		}

		const option: Option = {
			id,
			product_id,
			position,
			name,
		};

		this.options.push(option);

		return option;
	}

	async addVariant(params: AddVariantParams): Promise<Variant> {
		const id = `${this.variants.length + 1}`;

		const {
			product_id,
			sku,
			barcode,
			price,
			inventory_policy,
			quantity,
		} = params;

		const variant: Variant = {
			id,
			product_id,
			sku,
			barcode,
			price,
			inventory_policy,
			quantity,
			created_at: new Date(),
			updated_at: new Date(),
		};

		this.variants.push(variant);

		return variant;
	}

	async getVariants(productId: string): Promise<Variant[]> {
		const variants = [];
		for (const variant of this.variants) {
			if (productId === variant.product_id) {
				variants.push(variant);
			}
		}

		return variants;
	}

	async getOptions(productId: string): Promise<Option[]> {
		const options = [];
		for (const option of this.options) {
			if (productId === option.product_id) {
				options.push(option);
			}
		}
		return options;
	}

	async deleteVariant(id: string): Promise<Variant> {
		let variant: Variant;
		this.variants = this.variants.filter(item => {
			if(item.id === id) {
				variant = item;
				return false;
			}

			return true;
		});

		return variant;
	}

	async addImage(params: AddImageParams): Promise<Image> {
		const id = `${this.images.length + 1}`;

		const {image, product_id} = params;

		const img: Image = {
			id,
			image,
			product_id
		};

		this.images.push(img);

		return img;
	}
}
