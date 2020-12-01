import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import {
    ProductRepository,
    AddParams,
    AddOptionParams,
    AddVariantParams,
    AddImageParams,
    UpdateProductParams,
    AddVariantImageParams,
} from '@domain/repository/ProductRepository';
import {
    Product,
    Option,
    Image,
    Variant,
    VariantImage,
} from '@domain/model/Product';
import FileService from '@data/services/FileServices';
import { v4 as uuidv4 } from 'uuid';
import sizeOf from 'image-size';
import path from 'path';

export default class ProductDataRepository implements ProductRepository {
    private pool: Pool;
    private fileService: FileService;
    constructor() {
        this.pool = getConnection();
        this.fileService = new FileService();
    }

    async add(params: AddParams): Promise<Product> {
        let client: PoolClient;
        const query = `INSERT INTO product (store_id, title, body, vendor, tags, option_1, option_2, option_3)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *;`;
        const {
            storeId,
            title,
            body,
            vendor,
            option_1,
            option_2,
            option_3,
        } = params;
        let { tags } = params;

        try {
            client = await this.pool.connect();

            tags = [...new Set(tags)];

            const res = await client.query(query, [
                storeId,
                title,
                body,
                vendor,
                tags,
                option_1,
                option_2,
                option_3,
            ]);

            client.release();
            return mapProduct(res.rows[0]);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async update(params: UpdateProductParams): Promise<Product> {
        const {
            id,
            title,
            body,
            vendor,
            option_1,
            option_2,
            option_3,
        } = params;
        let { tags } = params;
        console.log(params);

        let client: PoolClient;
        const query = `UPDATE product SET 
        title = $2,
        vendor = $3,
        tags = $4,
        body = $5,
        option_1= $6, 
        option_2 = $7, 
        option_3 = $8
        WHERE id = $1
        RETURNING *;`;

        try {
            client = await this.pool.connect();

            tags = [...new Set(tags)];

            const res = await client.query(query, [
                id,
                title,
                vendor,
                tags,
                body,
                option_1,
                option_2,
                option_3,
            ]);

            client.release();
            const row = res.rows[0];
            const product = mapProduct(row);
            // if (!product.variants) {
            //     product.variants = [];
            // }

            // if (!!variants) {
            //     for (const variant of variants) {
            //         product.variants.push(await this.updateVariant(variant));
            //     }
            // }

            return product;
        } catch (e) {
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

    async addVariant(
        productId: string,
        variant: AddVariantParams
    ): Promise<Variant[]> {
        let client: PoolClient;
        const response: Variant[] = [];
        const query = `INSERT INTO product_variant (product_id, sku, barcode,
                price, quantity, option_1, option_2, option_3)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *;`;
        const {
            sku,
            barcode,
            price,
            quantity,
            option_1,
            option_2,
            option_3,
        } = variant;

        try {
            client = await this.pool.connect();
            const res = await client.query(query, [
                productId,
                sku || '',
                barcode || '',
                price || 0.0,
                quantity || 0,
                option_1 || null,
                option_2 || null,
                option_3 || null,
            ]);

            client.release();
            response.push(res.rows[0]);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
        return response;
    }

    async updateVariant(
        variantId: string,
        variant: AddVariantParams
    ): Promise<Variant[]> {
        let client: PoolClient;
        const response: Variant[] = [];

        const query = ` UPDATE product_variant
                        SET  sku=$1, barcode=$2, price=$3, quantity=$4,  option_1=$5, option_2=$6, option_3=$7
                        WHERE id='${variantId}' RETURNING *;`;

        const {
            sku,
            barcode,
            price,
            quantity,
            option_1,
            option_2,
            option_3,
        } = variant;

        try {
            client = await this.pool.connect();
            const res = await client.query(query, [
                sku || '',
                barcode || '',
                price || 0.0,
                quantity || 0,
                option_1 || null,
                option_2 || null,
                option_3 || null,
            ]);

            client.release();
            response.push(res.rows[0]);
            return response;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async removeVariant(variantId: string): Promise<boolean> {
        let client: PoolClient;

        const query = `UPDATE product_variant
                        SET  is_enabled=false
                        WHERE id='${variantId}' RETURNING *;`;

        const removeVariantImages = `DELETE FROM product_variant_image
        WHERE product_variant_id='${variantId}'`;

        try {
            client = await this.pool.connect();
            await client.query(removeVariantImages);
            const res = await client.query(query);
            client.release();

            return res.rows[0] ? true : false;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async addVariantImage(
        image: AddVariantImageParams
    ): Promise<VariantImage[]> {
        let client: PoolClient;
        const response: VariantImage[] = [];
        const query = `INSERT INTO product_variant_image (product_variant_id, product_image_id)
            VALUES ($1, $2) returning *;`;
        const { productVariantId, productImageId } = image;
        try {
            client = await this.pool.connect();
            const res = await client.query(query, [
                productVariantId,
                productImageId,
            ]);

            client.release();
            response.push(res.rows[0]);
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
        return response;
    }

    async removeVariantImage(
        variantImageId: string,
        productImageId: string
    ): Promise<boolean> {
        let client: PoolClient;

        const query = `DELETE FROM product_variant_image
            WHERE product_variant_id = '${variantImageId}' AND product_image_id='${productImageId}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);
            client.release();
            return res ? true : false;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async updateVariantImages(
        params: AddVariantImageParams[]
    ): Promise<VariantImage[]> {
        let client: PoolClient;
        const response: VariantImage[] = [];
        for (const image of params) {
            const query = `INSERT INTO product_variant_image (product_variant_id, product_image_id)
            VALUES ($1, $2) returning *;`;
            const { productVariantId, productImageId } = image;
            try {
                client = await this.pool.connect();
                const res = await client.query(query, [
                    productVariantId,
                    productImageId,
                ]);

                client.release();
                response.push(res.rows[0]);
            } catch (e) {
                if (!!client) {
                    client.release();
                }
                throw e;
            }
        }
        return response;
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
            const size = { height: 0, width: 0 }; // sizeOf.imageSize(image.path);
            const ext = extensionRegex.exec(image.name)[1];
            const result = await this.fileService.uploadImages({
                path: image.path,
                key: `products/${id}.${ext}`,
                bucket: 'unstock-files',
            });

            const query = `insert into product_image (product_id, src, width, height ) values ('${productId}', '${result.url}', ${size.height}, ${size.width}) returning id;`;

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

    async updateImages(
        productId: string,
        images: AddImageParams[],
        storeId: string
    ): Promise<Image[]> {
        let client: PoolClient;
        const extensionRegex = /(?:\.([^.]+))?$/;

        const response: Image[] = [];

        const toDelete = [];
        const toCreate = [];
        const query = `SELECT * FROM product_image WHERE product_id = '${productId}';`;
        client = await this.pool.connect();
        const productImages = await client.query(query);
        for (const image of images) {
            const findInSender = productImages.rows.find(
                (productImage) => productImage.id === image.name
            );
            if (!findInSender) {
                toCreate.push(image);
            }
        }

        for (const image of productImages.rows) {
            const findInDb = images.find(
                (dbImage) => dbImage.name === image.id
            );
            if (!findInDb) {
                image.basename = path.basename(image.src);
                toDelete.push(image);
            }
        }

        for (const image of toDelete) {
            const deleteQuery = `DELETE from product_image WHERE id='${image.id}';`;

            client = await this.pool.connect();
            const res = await client.query(deleteQuery);

            await this.fileService.deleteImage({
                key: `products/${image.basename}`,
                bucket: 'unstock-files',
            });
        }

        for (const image of toCreate) {
            const id = uuidv4();
            const size = { height: 0, width: 0 }; // sizeOf.imageSize(image.path);
            const ext = extensionRegex.exec(image.name)[1];
            const result = await this.fileService.uploadImages({
                path: image.path,
                key: `products/${id}.${ext}`,
                bucket: 'unstock-files',
            });

            const createQuery = `insert into product_image (product_id, src, width, height ) values ('${productId}', '${result.url}', ${size.height}, ${size.width}) returning id;`;

            client = await this.pool.connect();
            const res = await client.query(createQuery);
            response.push({
                id: res.rows[0].id,
                productId,
                image: result.url,
            });
        }

        return response;
    }

    async RemoveImage(imageId: string): Promise<boolean> {
        let client: PoolClient;
        const getImageInfo = `SELECT * from product_image WHERE id = '${imageId}'`;
        const deleteQuery = `DELETE from product_image WHERE id='${imageId}';`;

        client = await this.pool.connect();
        const image = await client.query(getImageInfo);
        if (image.rows[0]) {
            const imageS3 = image.rows[0].src.split('/');
            await client.query(deleteQuery);
            await this.fileService.deleteImage({
                key: `products/${imageS3[4]}`,
                bucket: 'unstock-files',
            });

            return true;
        } else {
            return false;
        }
    }

    async getImages(productId: string): Promise<Image[]> {
        let client: PoolClient;
        const query = `SELECT id, product_id, src FROM product_image WHERE product_id = '${productId}';`;
        try {
            client = await this.pool.connect();
            const res = await client.query(query);
            client.release();

            const images = [];
            for (const row of res.rows) {
                const { id, product_id, src } = row;

                images.push({
                    id,
                    productId: product_id,
                    image: src,
                });
            }
            return images;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async getImagesByID(id: string): Promise<any> {
        let client: PoolClient;
        const query = `SELECT id, product_id, src FROM product_image WHERE id = '${id}';`;
        try {
            client = await this.pool.connect();
            const res = await client.query(query);
            client.release();
            const image = res.rows[0];
            return {
                id: image.id,
                productId: image.product_id,
                preview: image.src,
            };
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async get(storeId: string): Promise<Product[]> {
        let client: PoolClient;
        const query = `SELECT * FROM product WHERE store_id = '${storeId}' AND is_deleted = false;`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();

            return res.rows.map(mapProduct);
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
                return mapProduct(row);
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
        WHERE product_id = '${productId}' AND is_enabled = true`;

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
                    option_1,
                    option_2,
                    option_3,
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
                    option_1,
                    option_2,
                    option_3,
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

    async getVariantById(id: string): Promise<Variant> {
        let client: PoolClient;
        const query = `SELECT * FROM product_variant 
        WHERE id = '${id}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();

            const {
                product_id,
                sku,
                barcode,
                price,
                inventoryPolicy,
                images,
                createdAt,
                updatedAt,
                quantity,
                option_1,
                option_2,
                option_3,
                is_taxable,
                tax,
                title,
                variant_number,
            } = res.rows[0];

            const variant = {
                id,
                productId: product_id,
                sku,
                barcode,
                price: parseFloat(price),
                inventoryPolicy,
                quantity,
                images,
                option_1,
                option_2,
                option_3,
                createdAt,
                updatedAt,
                is_taxable,
                tax,
                title,
                variant_number,
            };

            return variant;
        } catch (e) {
            if (!!client) {
                client.release();
            }
            throw e;
        }
    }

    async getVariantsImages(variantId: string): Promise<VariantImage[]> {
        let client: PoolClient;
        const query = `SELECT * FROM product_variant_image
        WHERE product_variant_id = '${variantId}'`;

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();

            return res.rows;
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

    async delete(id: string, storeId: string): Promise<Product> {
        let client: PoolClient;
        const query = `UPDATE product SET is_deleted=true WHERE id = '${id}' AND store_id = '${storeId}' RETURNING *;`;
        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            client.release();
            for (const row of res.rows) {
                const { store_id, title, body, vendor } = row;
                return {
                    id,
                    storeId: store_id,
                    title,
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

function mapProduct(row: any): Product {
    return {
        id: row.id,
        storeId: row.store_id,
        title: row.title,
        body: row.body,
        vendor: row.vendor,
        tags: row.tags,
        isPublish: row.is_publish,
        isArchive: row.is_archive,
        isDeleted: row.is_deleted,
        option_1: row.option_1,
        option_2: row.option_2,
        option_3: row.option_3,
        publishAt: row.publish_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function mapVariant(row: any): Variant {
    return {
        id: row.id,
        productId: row.product_id,
        sku: row.sku,
        barcode: row.barcode,
        price: parseFloat(`${row.price}`),
        quantity: parseInt(`${row.quantity}`, 10),
        inventoryPolicy: row.inventory_policy,
        images: [],
        option_1: row.option_1,
        option_2: row.option_2,
        option_3: row.option_3,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
