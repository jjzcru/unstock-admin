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
			const { storeId, name, body, vendor } = params;
			const res = await client.query(query, [
				storeId,
				name,
				body,
				vendor,
			]);

			client.release();
			const { id } = res.rows[0];

			return {
				id,
				storeId,
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
	async get(): Promise<Product[]> {
		let client: PoolClient;
		const query = `SELECT * FROM product;`;

		try {
			client = await this.pool.connect();
			const res = await client.query(query);

			client.release();
			const products: Array<Product> = res.rows.map(row => {
				const {
					id,
					store_id,
					name,
					body,
					vendor
				} = row;
				return {
					id,
					storeId: store_id,
					name,
					body,
					vendor
				}
			});

			return products;
		} catch (e) {
			if (!!client) {
				client.release();
			}
			throw e;
		}
	}
	async getByID(id: string): Promise<Product> {
		let client: PoolClient;
		const query = `SELECT * FROM product WHERE id = '${id}';`;

		try {
			client = await this.pool.connect();
			const res = await client.query(query);

			client.release();
			for(let row of res.rows) {
				const {
					id,
					store_id,
					name,
					body,
					vendor
				} = row;
				return {
					id,
					storeId: store_id,
					name,
					body,
					vendor
				}
			}

			return null;
		} catch (e) {
			if (!!client) {
				client.release();
			}
			throw e;
		}
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
	async delete(id: string): Promise<Product> {
		let client: PoolClient;
		const query = `DELETE FROM product WHERE id = '${id}' RETURNING *;`;

		try {
			client = await this.pool.connect();
			const res = await client.query(query);

			client.release();
			for(let row of res.rows) {
				const {
					id,
					store_id,
					name,
					body,
					vendor
				} = row;
				return {
					id,
					storeId: store_id,
					name,
					body,
					vendor
				}
			}

			return null;
		} catch (e) {
			if (!!client) {
				client.release();
			}
			throw e;
		}
	}
	deleteVariant(id: string): Promise<Variant> {
		throw new Error('Method not implemented.');
	}
}
