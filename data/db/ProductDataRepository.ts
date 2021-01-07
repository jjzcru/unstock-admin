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

export default class ProductDataRepository implements ProductRepository {
    private fileService: FileService;
    private imagePrefix: string;
    private bucketName: string;
    constructor() {
        this.fileService = new FileService();
        this.imagePrefix =
            process.env.APP_ENV === 'production'
                ? 'https://cdn.unstock.shop'
                : 'https://cdn.dev.unstock.shop';

        this.bucketName =
            process.env.APP_ENV === 'production'
                ? 'cdn.unstock.shop'
                : 'cdn.dev.unstock.shop';
    }

    async archive(productId: string, storeId: string): Promise<Product> {
        const query = `UPDATE product SET is_archive=true WHERE id = $1 
        AND store_id = $2 RETURNING *;`;
        const values = [productId, storeId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapProduct(rows[0]) : null;
    }

    async unarchive(productId: string, storeId: string): Promise<Product> {
        const query = `UPDATE product SET is_archive=false WHERE id = $1 
        AND store_id = $2 RETURNING *;`;
        const values = [productId, storeId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapProduct(rows[0]) : null;
    }

    async publish(productId: string, storeId: string): Promise<Product> {
        const query = `UPDATE product SET is_publish=true WHERE id = $1 
        AND store_id = $2 RETURNING *;`;
        const values = [productId, storeId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapProduct(rows[0]) : null;
    }

    async hide(productId: string, storeId: string): Promise<Product> {
        const query = `UPDATE product SET is_publish=false WHERE id = $1 
        AND store_id = $2 RETURNING *;`;
        const values = [productId, storeId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapProduct(rows[0]) : null;
    }

    async validSlug(slug: string, storeId: string): Promise<any> {
        const query = `SELECT slug, id FROM product 
        WHERE store_id = $1 AND slug = $2;`;
        const values = [storeId, slug];
        const { rows } = await runQuery(query, values);
        return rows.length
            ? { result: true, productId: rows[0].id }
            : { result: false };
    }

    async updateVariantInventory(
        variantId: string,
        qty: number
    ): Promise<boolean> {
        const query = ` UPDATE product_variant
                        SET  quantity=$1
                        WHERE id=$2 RETURNING *;`;
        const values = [qty, variantId];

        const { rows } = await runQuery(query, values);

        return rows && rows.length ? rows.map(mapVariant) : [];
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
            slug,
        } = params;

        const query = `INSERT INTO product (store_id, title, body, vendor, tags, 
        option_1, option_2, option_3, slug)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *;`;
        const values = [
            storeId,
            title,
            body,
            vendor,
            tags || [],
            option_1,
            option_2,
            option_3,
            slug,
        ];

        const { rows } = await runQuery(query, values);

        return rows && rows.length ? mapProduct(rows[0]) : null;
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
            slug,
        } = params;

        const query = `UPDATE product SET 
        title = $2,
        vendor = $3,
        tags = $4,
        body = $5,
        option_1= $6, 
        option_2 = $7, 
        option_3 = $8,
        slug = $9
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
            slug,
        ];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapProduct(rows[0]) : null;
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
        return rows && rows.length ? rows.map(mapVariant) : [];
    }

    async updateVariant(
        variantId: string,
        variant: AddVariantParams
    ): Promise<Variant[]> {
        const { sku, barcode, price, option_1, option_2, option_3 } = variant;

        const query = ` UPDATE product_variant
                        SET  sku=$1, barcode=$2, price=$3, 
                        option_1=$4, option_2=$5, option_3=$6
                        WHERE id=$7 RETURNING *;`;
        const values = [
            sku || '',
            barcode || '',
            price || 0.0,
            option_1 || null,
            option_2 || null,
            option_3 || null,
            variantId,
        ];

        const { rows } = await runQuery(query, values);

        return rows && rows.length ? rows.map(mapVariant) : [];
    }

    async removeVariant(variantId: string): Promise<boolean> {
        const query = `UPDATE product_variant
                        SET is_deleted=true, is_enabled=false
                        WHERE id=$1 RETURNING *;`;

        await this.removeVariantImages(variantId);

        const values = [variantId];
        const { rows } = await runQuery(query, values);

        return rows && rows.length ? rows : null;
    }

    async removeVariantImages(variantId: string): Promise<boolean> {
        const query = `DELETE FROM product_variant_image 
        WHERE product_variant_id=$1`;
        const values = [variantId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows : null;
    }

    async addVariantImage(
        image: AddVariantImageParams
    ): Promise<VariantImage[]> {
        const { productVariantId, productImageId, position } = image;
        const query = `INSERT INTO product_variant_image (product_variant_id, 
            product_image_id, position) VALUES ($1, $2, $3) returning *;`;
        const values = [productVariantId, productImageId, position];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows.map(mapVariantImage) : [];
    }

    async removeVariantImage(
        variantImageId: string,
        productImageId: string
    ): Promise<boolean> {
        const query = `DELETE FROM product_variant_image
            WHERE product_variant_id = $1 AND product_image_id=$2 returning *;`;
        const values = [variantImageId, productImageId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? rows : null;
    }

    async updateVariantImages(
        params: AddVariantImageParams[]
    ): Promise<VariantImage[]> {
        const response: VariantImage[] = [];
        for (const image of params) {
            const { productVariantId, productImageId } = image;
            const query = `INSERT INTO product_variant_image (product_variant_id, 
                product_image_id) VALUES ($1, $2) returning *;`;
            const values = [productVariantId, productImageId];

            const { rows } = await runQuery(query, values);

            if (rows && rows.length) {
                response.push(mapVariantImage(rows[0]));
            }
        }
        return response;
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
            const size = { height: 0, width: 0 };
            const ext = extensionRegex.exec(image.name)[1];
            const key = `${storeId}/products/${id}.${ext}`;

            const result = await this.fileService.uploadImages({
                filePath: image.path,
                key,
                bucket: this.bucketName,
            });
            const query = `INSERT INTO product_image (product_id, src, width, 
                height) VALUES ($1, $2, $3, $4) RETURNING *;`;
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

    async imageToDelete(id: string): Promise<boolean> {
        const query = `DELETE from product_image WHERE id=$1;`;
        const values = [id];
        await runQuery(query, values);
        return true;
    }

    async deleteImage(imageId: string, storeId: string): Promise<boolean> {
        const imageInfo = await this.getImagesByID(imageId);
        if (imageInfo) {
            const query = `DELETE from product_image WHERE id=$1;`;
            const values = [imageId];

            const imageS3 = imageInfo[0].image.split('/');
            const { rows } = await runQuery(query, values);
            await this.fileService.deleteImage({
                key: `products/${imageS3[4]}`,
                bucket: this.bucketName,
            });
            if (rows && rows.length) {
                return true;
            }
        } else {
            return null;
        }
    }

    async getImages(productId: string): Promise<Image[]> {
        const query = `SELECT id, product_id, src FROM product_image 
        WHERE product_id = $1;`;
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
        }
        return images;
    }

    async getImagesByID(id: string): Promise<any> {
        const query = `SELECT * 
        FROM product_image WHERE id = $1;`;
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

        return rows && rows.length ? rows.map(mapProduct) : [];
    }

    async getByID(id: string, storeId: string): Promise<Product> {
        const query = `SELECT * FROM product 
        WHERE id = $1 AND store_id=$2 and is_deleted = false;`;
        const values = [id, storeId];

        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapProduct(rows[0]) : null;
    }

    async getVariants(productId: string): Promise<Variant[]> {
        const query = `SELECT * FROM product_variant 
        WHERE product_id = $1 AND is_deleted = false;`;
        const values = [productId];

        const { rows } = await runQuery(query, values);

        return rows.map(mapVariant);
    }

    async getVariantById(id: string): Promise<Variant> {
        const query = `SELECT * FROM product_variant 
        WHERE id = $1 AND is_deleted = false;`;
        const values = [id];

        const { rows } = await runQuery(query, values);

        return rows && rows.length ? mapVariant(rows[0]) : null;
    }

    async getVariantsImages(variantId: string): Promise<VariantImage[]> {
        const query = `SELECT * FROM product_variant_image
        WHERE product_variant_id =$1`;
        const values = [variantId];
        const { rows } = await runQuery(query, values);

        return rows.map(mapVariantImage);
    }

    async getVariantsByStore(storeId: string): Promise<Variant[]> {
        const query = `SELECT pv.* FROM product_variant pv 
        LEFT JOIN product p ON(pv.product_id = p.id) 
        WHERE p.is_deleted = false AND pv.is_deleted = false AND 
        p.store_id = $1;`;

        const values = [storeId];
        const { rows } = await runQuery(query, values);
        return rows.map(mapVariant);
    }

    async delete(id: string, storeId: string): Promise<Product> {
        const query = `UPDATE product SET is_deleted=true WHERE id = $1 
        AND store_id = $2 RETURNING *;`;
        const values = [id, storeId];
        const { rows } = await runQuery(query, values);

        return rows && rows.length ? mapProduct(rows[0]) : null;
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

    async getVendors(storeId: string): Promise<string[]> {
        const query = `SELECT vendor FROM product 
        WHERE store_id=$1`;
        const values = [storeId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            const vendors: string[] = [];
            for (const row of rows) {
                vendors.push(row.vendor);
            }
            return [...new Set(vendors)];
        }
        return null;
    }
}

function mapProduct(row: any): Product {
    if (!row) {
        return null;
    }

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
        option_1: row.option_1 || null,
        option_2: row.option_2 || null,
        option_3: row.option_3 || null,
        publishAt: row.publish_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        slug: row.slug,
    };
}

function mapVariant(row: any): Variant {
    if (!row) {
        return null;
    }

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

function mapVariantImage(row: any): VariantImage {
    if (!row) {
        return null;
    }

    const { product_variant_id, product_image_id, position } = row;

    return {
        id: row.id,
        productVariantId: product_variant_id,
        productImageId: product_image_id,
        position,
    };
}
