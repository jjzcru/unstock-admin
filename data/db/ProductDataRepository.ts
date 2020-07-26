import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import {
	ProductRepository,
	AddParams,
	AddOptionParams,
	AddVariantParams,
	AddImageParams,
	UpdateParams,
} from '../../domain/repository/ProductRepository';
import { Product, Option, Image, Variant } from '../../domain/model/Product';

export default class ProductDataRepository implements ProductRepository {
	private pool: Pool;
	constructor() {
		this.pool = getConnection();
	}
	async add(params: AddParams): Promise<Product> {
		let client: PoolClient;
		const query = `INSERT INTO product (store_id, name, body, vendor) 
        VALUES ($1, $2, $3, $4) returning id;`;

		try {
			client = await this.pool.connect();
			const { store_id, name, body, vendor } = params;
			const res = await client.query(query, [
				store_id,
				name,
				body,
				vendor,
			]);

			client.release();
			const { id } = res.rows[0];

			return {
				id,
				store_id,
				name,
				body,
				vendor,
			};
		} catch (e) {
			if (!!client) {
				client.release();
			}
			throw e;
		}
	}

	addOption(params: AddOptionParams): Promise<Option> {
		throw new Error('Method not implemented.');
	}
	addVariant(params: AddVariantParams): Promise<Variant> {
		throw new Error('Method not implemented.');
	}
	addImage(params: AddImageParams): Promise<Image> {
		throw new Error('Method not implemented.');
	}
	get(): Promise<Product[]> {
		throw new Error('Method not implemented.');
	}
	getByID(id: string): Promise<Product> {
		throw new Error('Method not implemented.');
	}
	getVariants(productId: string): Promise<Variant[]> {
		throw new Error('Method not implemented.');
	}
	getOptions(productId: string): Promise<Option[]> {
		throw new Error('Method not implemented.');
	}
	update(params: UpdateParams): Promise<Product> {
		throw new Error('Method not implemented.');
	}
	delete(id: string): Promise<Product> {
		throw new Error('Method not implemented.');
	}
	deleteVariant(id: string): Promise<Variant> {
		throw new Error('Method not implemented.');
	}
}
