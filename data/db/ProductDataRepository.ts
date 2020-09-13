import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import {
    ProductRepository,
    AddParams,
    AddOptionParams,
    AddVariantParams,
    AddImageParams,
    UpdateParams,
} from '@domain/repository/ProductRepository';
import { Product, Option, Image, Variant } from '@domain/model/Product';
import FileService from '@data/services/FileServices';
import { v4 as uuidv4 } from 'uuid';

export default class ProductDataRepository implements ProductRepository {
    private pool: Pool;
    private fileService: FileService;
    constructor() {
        this.pool = getConnection();
        this.fileService = new FileService();
    }

    async add(params: AddParams): Promise<Product> {
        let client: PoolClient;
        const query = `INSERT INTO product (store_id, name, body, vendor, tags)
        VALUES ($1, $2, $3, $4, $5) returning id;`;
        const { storeId, name, body, vendor } = params;
        let { tags } = params;

        try {
            client = await this.pool.connect();

            tags = [...new Set(tags)];

            const res = await client.query(query, [
                storeId,
                name,
                body,
                vendor,
                tags,
            ]);

            client.release();
            const { id } = res.rows[0];

            return {
                id,
                storeId,
                name,
                body,
                vendor,
                tags,
            };
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async addOption(params: AddOptionParams): Promise<Option> {
        let client: PoolClient;
        const query = `INSERT INTO product_option (product_id, name)
		VALUES ($1, $2) returning id;`;
        const { productId, name } = params;

        try {
            client = await this.pool.connect();

            const res = await client.query(query, [productId, name]);

            client.release();
            const { id } = res.rows[0];

            return {
                id,
                productId,
                name,
            };
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async addVariant(params: AddVariantParams): Promise<Variant> {
        let client: PoolClient;
        const query = `INSERT INTO product_variant (product_id, sku, barcode,
		price, inventory_policy, quantity, "type")
        VALUES ($1, $2, $3, $4, $5, $6, $7) returning id;`;

        const {
            productId,
            sku,
            barcode,
            price,
            inventoryPolicy,
            quantity,
            type,
        } = params;

        try {
            client = await this.pool.connect();

            const res = await client.query(query, [
                productId,
                sku || '',
                barcode || '',
                price || 0.0,
                inventoryPolicy,
                quantity || 0,
                type,
            ]);

            client.release();
            const { id } = res.rows[0];

            return {
                id,
                productId,
                sku,
                barcode,
                price,
                inventoryPolicy,
                quantity,
            };
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    addImage(params: AddImageParams): Promise<Image> {
        throw new Error('Method not implemented.');
    }

    async addImages(
        productId: string,
        images: AddImageParams[],
        storeId: string
    ): Promise<Image[]> {
        let client: PoolClient;
        const extensionRegex = /(?:\.([^.]+))?$/;

        // TODO Review thiscase for the regex
        // Image.test.jpg

        const response: Image[] = [];

        for (const image of images) {
            const id = uuidv4();
            const ext = extensionRegex.exec(image.name)[1];
            const result = await this.fileService.uploadImages({
                path: image.path,
                key: `products/${id}.${ext}`,
                bucket: 'unstock-files',
            });

            const query = `insert into product_image (product_id, src, width, height ) values ('${productId}', '${result.url}', 10, 10) returning id;`;

            client = await this.pool.connect();
            const res = await client.query(query);
            response.push({
                id: res.rows[0].id,
                productId,
                image: result.url,
            });
        }

        return response;
    }

    getImages(productId: string): Promise<Image[]> {
        throw new Error('Method not implemented.');
    }

    async get(storeId: string): Promise<Product[]> {
        let client: PoolClient;
        const query = `SELECT * FROM product WHERE store_id = '${storeId}';`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            const products: Product[] = res.rows.map((row) => {
                const { id, store_id, name, body, vendor, tags } = row;
                return {
                    id,
                    storeId: store_id,
                    name,
                    body,
                    vendor,
                    tags,
                };
            });

            return products;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
    async getByID(id: string, storeId: string): Promise<Product> {
        let client: PoolClient;
        const query = `SELECT * FROM product 
        WHERE id = '${id}' AND store_id='${storeId}';`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                const { store_id, name, body, vendor, tags } = row;
                return {
                    id,
                    storeId: store_id,
                    name,
                    body,
                    vendor,
                    tags,
                };
            }

            return null;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
    async getVariants(productId: string): Promise<Variant[]> {
        let client: PoolClient;
        const query = `SELECT * FROM product_variant 
        WHERE product_id = '${productId}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            const variants = [];
            for (const row of res.rows) {
                const {
                    id,
                    product_id,
                    sku,
                    barcode,
                    price,
                    inventoryPolicy,
                    images,
                    createdAt,
                    updatedAt,
                    quantity,
                    options,
                } = row;

                variants.push({
                    id,
                    productId: product_id,
                    sku,
                    barcode,
                    price: parseFloat(price),
                    inventoryPolicy,
                    quantity,
                    images,
                    options,
                    createdAt,
                    updatedAt,
                });
            }

            return variants;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
    async getVariantsByStore(storeId: string): Promise<Variant[]> {
        let client: PoolClient;
        const query = `SELECT pv.* FROM product_variant pv 
        LEFT JOIN product p ON(pv.product_id = p.id) 
        WHERE p.store_id = '${storeId}';`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            const variants = [];
            for (const row of res.rows) {
                const {
                    id,
                    product_id,
                    sku,
                    barcode,
                    price,
                    inventory_policy,
                    images,
                    created_at,
                    updated_at,
                    quantity,
                    options,
                } = row;

                variants.push({
                    id,
                    productId: product_id,
                    sku,
                    barcode,
                    price: parseFloat(price),
                    inventoryPolicy: inventory_policy,
                    quantity,
                    images,
                    options,
                    createdAt: created_at,
                    updatedAt: updated_at,
                });
            }

            return variants;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
    getOptions(productId: string): Promise<Option[]> {
        throw new Error('Method not implemented.');
    }
    update(params: UpdateParams): Promise<Product> {
        throw new Error('Method not implemented.');
    }
    async delete(id: string, storeId: string): Promise<Product> {
        let client: PoolClient;
        const query = `DELETE FROM product 
        WHERE id = '${id}' AND store_id = '${storeId}' RETURNING *;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                const { store_id, name, body, vendor } = row;
                return {
                    id,
                    storeId: store_id,
                    name,
                    body,
                    vendor,
                };
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
    async getTags(storeId: string): Promise<string[]> {
        let client: PoolClient;
        const query = `SELECT tags FROM product 
        WHERE store_id='${storeId}';`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            const tags: string[] = [];
            for (const row of res.rows) {
                tags.push(...row.tags);
            }
            return [...new Set(tags)];
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }
}
