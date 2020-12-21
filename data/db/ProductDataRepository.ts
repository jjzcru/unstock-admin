import { runQuery } from './db';
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
import path from 'path';

export default class ProductDataRepository implements ProductRepository {
    private fileService: FileService;
    private imagePrefix: string;
    private bucketName: string;
    constructor() {
        this.fileService = new FileService();
        this.imagePrefix =
            process.env.NODE_ENV === 'production'
                ? 'https://cdn.unstock.shop'
                : 'https://cdn-dev.unstock.shop';

        this.bucketName =
            process.env.NODE_ENV === 'production'
                ? 'cdn.unstock.shop'
                : 'cdn.dev.unstock.shop';
    }

    async add(params: AddParams): Promise<Product> {
        const {
            storeId,
            title,
            body,
            vendor,
            option_1,
            option_2,
            option_3,
            tags,
        } = params;

        const query = `INSERT INTO product (store_id, title, body, vendor, tags, option_1, option_2, option_3)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *;`;
        const values = [
            storeId,
            title,
            body,
            vendor,
            tags,
            option_1,
            option_2,
            option_3,
        ];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            const { id } = rows[0];
            return mapProduct(rows[0]);
        }
        return null;
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
            tags,
        } = params;

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

        const values = [
            id,
            title,
            vendor,
            tags,
            body,
            option_1,
            option_2,
            option_3,
        ];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return mapProduct(rows[0]);
        }

        return null;
    }

    async addOption(params: AddOptionParams): Promise<Option> {
        const { productId, name } = params;
        const query = `INSERT INTO product_option (product_id, name)
		VALUES ($1, $2) returning id;`;
        const values = [productId, name];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            const { id } = rows[0];
            return {
                id,
                productId,
                name,
            };
        }
        return null;
    }

    async addVariant(
        productId: string,
        variant: AddVariantParams
    ): Promise<Variant[]> {
        const {
            sku,
            barcode,
            price,
            quantity,
            option_1,
            option_2,
            option_3,
        } = variant;
        const response: Variant[] = [];
        const query = `INSERT INTO product_variant (product_id, sku, barcode,
                price, quantity, option_1, option_2, option_3)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning *;`;

        const values = [
            productId,
            sku || '',
            barcode || '',
            price || 0.0,
            quantity || 0,
            option_1 || null,
            option_2 || null,
            option_3 || null,
        ];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            response.push(rows[0]);
            return response;
        }
        return null;
    }

    async updateVariant(
        variantId: string,
        variant: AddVariantParams
    ): Promise<Variant[]> {
        const {
            sku,
            barcode,
            price,
            quantity,
            option_1,
            option_2,
            option_3,
        } = variant;

        const response: Variant[] = [];

        const query = ` UPDATE product_variant
                        SET  sku=$1, barcode=$2, price=$3, quantity=$4,  option_1=$5, option_2=$6, option_3=$7
                        WHERE id=$8 RETURNING *;`;
        const values = [
            sku || '',
            barcode || '',
            price || 0.0,
            quantity || 0,
            option_1 || null,
            option_2 || null,
            option_3 || null,
            variantId,
        ];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows[0];
        }
        return null;
    }

    async removeVariant(variantId: string): Promise<boolean> {
        const query = `UPDATE product_variant
                        SET is_deleted=true
                        WHERE id=$1 RETURNING *;`;

        await this.removeVariantImages(variantId);

        const values = [variantId];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return true;
        }

        return false;
    }

    async removeVariantImages(variantId: string): Promise<boolean> {
        const query = `DELETE FROM product_variant_image WHERE product_variant_id=$1`;
        const values = [variantId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return true;
        }
        return false;
    }

    async addVariantImage(
        image: AddVariantImageParams
    ): Promise<VariantImage[]> {
        const { productVariantId, productImageId } = image;
        const query = `INSERT INTO product_variant_image (product_variant_id, product_image_id)
            VALUES ($1, $2) returning *;`;
        const values = [productVariantId, productImageId];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows[0];
        }
        return null;
    }

    async removeVariantImage(
        variantImageId: string,
        productImageId: string
    ): Promise<boolean> {
        const query = `DELETE FROM product_variant_image
            WHERE product_variant_id = $1 AND product_image_id=$1`;
        const values = [variantImageId, productImageId];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return true;
        }
        return null;
    }

    async updateVariantImages(
        params: AddVariantImageParams[]
    ): Promise<VariantImage[]> {
        const response: VariantImage[] = [];
        for (const image of params) {
            const { productVariantId, productImageId } = image;
            const query = `INSERT INTO product_variant_image (product_variant_id, product_image_id)
            VALUES ($1, $2) returning *;`;
            const values = [productVariantId, productImageId];

            const { rows } = await runQuery(query, values);

            if (rows && rows.length) {
                response.push(rows[0]);
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
        const extensionRegex = /(?:\.([^.]+))?$/;

        const response: Image[] = [];

        for (const image of images) {
            const id = uuidv4();
            const size = { height: 0, width: 0 }; // sizeOf.imageSize(image.path);
            const ext = extensionRegex.exec(image.name)[1];
            const key = `${storeId}/products/${id}.${ext}`;

            const result = await this.fileService.uploadImages({
                filePath: image.path,
                key,
                bucket: this.bucketName,
            });

            const query = `insert into product_image (product_id, src, width, height ) values ($1, $2, $3, $4) returning id;`;
            const values = [productId, result.url, size.height, size.width];

            const { rows } = await runQuery(query, values);

            if (rows && rows.length) {
                response.push({
                    id: rows[0].id,
                    productId,
                    image: `${this.imagePrefix}/${key}`,
                });
            }
        }

        return response;
    }

    async updateImages(
        productId: string,
        images: AddImageParams[],
        storeId: string
    ): Promise<Image[]> {
        const response: Image[] = [];
        const toDelete = [];
        const toCreate = [];

        const query = `SELECT * FROM product_image WHERE product_id = $1;`;
        const values = [productId];
        const { rows } = await runQuery(query, values);
        const productImages = rows;

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
            await this.imageToDelete(image.id);
            await this.fileService.deleteImage({
                key: `products/${image.basename}`,
                bucket: this.bucketName,
            });
        }

        for (const image of toCreate) {
            await this.addImages(productId, image, storeId);
        }

        return response;
    }

    async imageToDelete(id: string): Promise<boolean> {
        const query = `DELETE from product_image WHERE id=$1;`;
        const values = [id];
        await runQuery(query, values);
        return true;
    }

    async deleteImage(imageId: string): Promise<boolean> {
        // const getImageInfo = `SELECT * from product_image WHERE id = '${imageId}'`;
        // const deleteQuery = `DELETE from product_image WHERE id='${imageId}';`;

        // client = await this.pool.connect();
        // const image = await client.query(getImageInfo);
        // if (image.rows[0]) {
        //     const imageS3 = image.rows[0].src.split('/');
        //     await client.query(deleteQuery);
        //     await this.fileService.deleteImage({
        //         key: `products/${imageS3[4]}`,
        //         bucket: this.bucketName,
        //     });

        //     return true;
        // } else {
        //     return false;
        // }
        throw new Error('Method not implemented.');
    }

    async getImages(productId: string): Promise<Image[]> {
        const query = `SELECT id, product_id, src FROM product_image WHERE product_id = $1;`;
        const values = [productId];

        const { rows } = await runQuery(query, values);

        const images = [];
        if (rows && rows.length) {
            for (const row of rows) {
                const { id, product_id, src } = row;

                images.push({
                    id,
                    productId: product_id,
                    image: `${this.imagePrefix}/${src}`,
                });
            }
            return images;
        }
        return null;
    }

    async getImagesByID(id: string): Promise<any> {
        const query = `SELECT id, product_id, src FROM product_image WHERE id = $1;`;
        const values = [id];

        const { rows } = await runQuery(query, values);

        const images = [];
        if (rows && rows.length) {
            for (const row of rows) {
                const { product_id, src } = row;

                images.push({
                    id,
                    productId: product_id,
                    image: `${this.imagePrefix}/${src}`,
                });
            }
            return images;
        }
        return null;
    }

    async get(storeId: string): Promise<Product[]> {
        const query = `SELECT * FROM product WHERE store_id = $1
        AND is_deleted = false;`;
        const values = [storeId];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows.map(mapProduct);
        }
        return null;
    }

    async getByID(id: string, storeId: string): Promise<Product> {
        const query = `SELECT * FROM product 
        WHERE id = $1 AND store_id=$1 and is_deleted = false;`;
        const values = [id, storeId];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return rows[0].map(mapProduct);
        }
        return null;
    }

    async getVariants(productId: string): Promise<Variant[]> {
        const query = `SELECT * FROM product_variant 
        WHERE product_id = $1 AND is_deleted = false;`;
        const values = [productId];

        const { rows } = await runQuery(query, values);
        const variants = [];
        if (rows && rows.length) {
            for (const row of rows) {
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
        }
        return null;
    }

    async getVariantById(id: string): Promise<Variant> {
        const query = `SELECT * FROM product_variant 
        WHERE id = $1 AND is_deleted = false;`;
        const values = [id];

        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            const variant = rows[0];
            return variant;
        }
        return null;
    }

    async getVariantsImages(variantId: string): Promise<VariantImage[]> {
        const query = `SELECT * FROM product_variant_image
        WHERE product_variant_id =$1`;
        const values = [variantId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return rows;
        }
        return null;
    }

    async getVariantsByStore(storeId: string): Promise<Variant[]> {
        const query = `SELECT pv.* FROM product_variant pv 
        LEFT JOIN product p ON(pv.product_id = p.id) 
        WHERE p.is_deleted = false AND pv.is_deleted = false AND 
        p.store_id = $1;`;

        const values = [storeId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            const variants = [];
            for (const row of rows) {
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
        }
        return null;
    }

    getOptions(productId: string): Promise<Option[]> {
        throw new Error('Method not implemented.');
    }

    async delete(id: string, storeId: string): Promise<Product> {
        const query = `UPDATE product SET is_deleted=true WHERE id = $1 AND store_id = $2 RETURNING *;`;
        const values = [id, storeId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            for (const row of rows) {
                const { store_id, title, body, vendor } = row;
                return {
                    id,
                    storeId: store_id,
                    title,
                    body,
                    vendor,
                };
            }
        }
        return null;
    }

    deleteVariant(id: string): Promise<Variant> {
        throw new Error('Method not implemented.');
    }

    async getTags(storeId: string): Promise<string[]> {
        const query = `SELECT tags FROM product 
        WHERE store_id=$1 AND is_deleted = false;`;
        const values = [storeId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            const tags: string[] = [];
            for (const row of rows) {
                tags.push(...row.tags);
            }
            return [...new Set(tags)];
        }
        return null;
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
