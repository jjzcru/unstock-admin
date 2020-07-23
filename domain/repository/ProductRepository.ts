import { Product, Option, Variant, Image } from '../model/Product';

export interface ProductRepository {
	add(params: AddParams): Promise<Product>;
	addOption(params: AddOptionParams): Promise<Option>;
	addVariant(params: AddVariantParams): Promise<Variant>;
	addImage(params: AddImageParams): Promise<Image>;
	get(): Promise<Product[]>;
	getByID(id: string): Promise<Product>;
	getVariants(productId: string): Promise<Variant[]>;
	getOptions(productId: string): Promise<Option[]>;
	update(params: UpdateParams): Promise<Product>;
	delete(id: string): Promise<Product>;
	deleteVariant(id: string): Promise<Variant>;
}

export interface AddParams {
	store_id: string;
	name: string;
	vendor: string;
	description: string;
	category?: string;
	tags?: string[];
}

export interface AddImageParams {
	image: string;
	product_id: string;
}

export interface UpdateParams {
	id: string;
	name?: string;
	description?: string;
	price: number;
	sku?: string;
	barcode?: string;
	inventoryPolicy?: 'allow' | 'block';
	quantity?: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface AddOptionParams {
	product_id: string;
	name: string;
}

export interface AddVariantParams {
	product_id: string;
	sku?: string;
	barcode?: string;
	price: number;
	inventory_policy: 'allow' | 'block';
	quantity: number;
}

