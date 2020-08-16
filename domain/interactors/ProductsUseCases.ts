import { UseCase } from './UseCase';
import { ProductRepository } from '../repository/ProductRepository';
import { Product, Image, Variant } from '../model/Product';
import ProductDataRepository from '@data/db/ProductDataRepository';
import { throwError } from '@errors';

export class AddProduct implements UseCase {
    private params: AddProductParams;
    private repository: ProductRepository;

    constructor(
        params: AddProductParams,
        repository: ProductRepository = new ProductDataRepository()
    ) {
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
            inventoryPolicy,
        } = this.params;

        const product = await this.repository.add({
            storeId,
            name,
            vendor,
            body,
            tags,
            category,
        });

        const variant = await this.repository.addVariant({
            productId: product.id,
            sku,
            barcode,
            price,
            quantity,
            inventoryPolicy,
            type: 'default',
        });

        product.variants = [variant];

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
        const { image, productId } = this.params;
        return this.repository.addImage({
            productId,
            image,
        });
    }
}

export interface AddImageParams {
    image: string;
    productId: string;
}

export class UpdateProduct implements UseCase {
    execute(): Promise<any> {
        throw new Error('Method not implemented.');
    }
}

export class GetProducts implements UseCase {
    private storeId: string;
    private variants: Variant[];
    private productRepository: ProductRepository;

    constructor(
        storeId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.storeId = storeId;
        this.productRepository = repository;
    }
    async execute(): Promise<Product[]> {
        let products = await this.productRepository.get(this.storeId);
        if (!!products.length) {
            this.variants = await this.productRepository.getVariantsByStore(
                this.storeId
            );
            const map = this.mapVariants();
            products = products.map((product) => {
                // console.log(map.get(product.id));
                const variants = map.get(product.id);
                if (!!variants) {
                    product.variants = variants;
                }
                return product;
            });
        }

        return products;
    }
    mapVariants(): Map<string, Variant[]> {
        const map: Map<string, Variant[]> = new Map();
        for (const variant of this.variants) {
            const { productId } = variant;

            if (!map.get(productId)) {
                map.set(productId, []);
            }

            delete variant.productId;

            const variants = map.get(productId);
            variants.push(variant);

            map.set(productId, variants);
        }

        return map;
    }
}

export class GetProductByID implements UseCase {
    private id: string;
    private storeId: string;
    private productRepository: ProductRepository;

    constructor(
        id: string,
        storeId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.id = id;
        this.storeId = storeId;
        this.productRepository = repository;
    }
    async execute(): Promise<Product> {
        const product = await this.productRepository.getByID(
            this.id,
            this.storeId
        );

        if (!product) {
            throwError('PRODUCT_NOT_FOUND');
        }

        product.variants = await this.productRepository.getVariants(this.id);

        return product;
    }
}

export class GetTags implements UseCase {
    private storeId: string;
    private productRepository: ProductRepository;

    constructor(
        storeId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.storeId = storeId;
        this.productRepository = repository;
    }
    async execute(): Promise<string[]> {
        return this.productRepository.getTags(this.storeId);
    }
}

export class DeleteProduct implements UseCase {
    private id: string;
    private storeId: string;
    private productRepository: ProductRepository;

    constructor(
        id: string,
        storeId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.id = id;
        this.storeId = storeId;
        this.productRepository = repository;
    }
    async execute(): Promise<Product> {
        const product = await this.productRepository.delete(
            this.id,
            this.storeId
        );
        if (!product) {
            throwError('PRODUCT_NOT_FOUND');
        }

        return product;
    }
}
