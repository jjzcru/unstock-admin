import { UseCase } from './UseCase';
import {
    AddVariantParams,
    ProductRepository,
    AddVariantImageParams,
} from '../repository/ProductRepository';
import { Product, Image, Variant, VariantImage } from '../model/Product';
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
        const { storeId, title, body, tags, category, vendor } = this.params;

        const product = await this.repository.add({
            storeId,
            title,
            vendor,
            body,
            tags,
            category,
        });
        return product;
    }
}

export interface AddProductParams {
    title: string;
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

export class AddProductVariants implements UseCase {
    private productId: string;
    private variants: AddVariantParams[];
    private repository: ProductRepository;

    constructor(
        productId: string,
        variants: AddVariantParams[],
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.productId = productId;
        this.variants = variants;
        this.repository = repository;
    }

    execute(): Promise<Variant[]> {
        return this.repository.addVariant(this.productId, this.variants);
    }
}

export class AddVariantImage implements UseCase {
    private variantImages: AddVariantImageParams[];
    private repository: ProductRepository;

    constructor(
        variantImages: AddVariantImageParams[],
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.variantImages = variantImages;
        this.repository = repository;
    }

    execute(): Promise<VariantImage[]> {
        return this.repository.addVariantImage(this.variantImages);
    }
}

export class AddProductImages implements UseCase {
    private images: AddImageParams[];
    private repository: ProductRepository;
    private productId: string;
    private storeId: string;

    constructor(
        productId: string,
        images: AddImageParams[],
        storeId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.productId = productId;
        this.storeId = storeId;
        this.images = images;
        this.repository = repository;
    }

    execute(): Promise<Image[]> {
        return this.repository.addImages(
            this.productId,
            this.images,
            this.storeId
        );
    }
}

export class UpdateProductImages implements UseCase {
    private images: AddImageParams[];
    private repository: ProductRepository;
    private productId: string;
    private storeId: string;

    constructor(
        productId: string,
        images: AddImageParams[],
        storeId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.productId = productId;
        this.storeId = storeId;
        this.images = images;
        this.repository = repository;
    }

    execute(): Promise<Image[]> {
        return this.repository.updateImages(
            this.productId,
            this.images,
            this.storeId
        );
    }
}

export interface AddImageParams {
    path: string;
    name: string;
}

export class UpdateProduct implements UseCase {
    private params: UpdateProductParams;
    private repository: ProductRepository;

    constructor(
        params: UpdateProductParams,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.params = params;
        this.repository = repository;
    }

    async execute(): Promise<Product> {
        const {
            id,
            title,
            body,
            variants,
            vendor,
            storeId,
            tags,
        } = this.params;

        const product = await this.repository.getByID(id, storeId);
        if (!product) {
            throwError('PRODUCT_NOT_FOUND');
        }

        return this.repository.update({
            id,
            title: !!this.params.title ? name : product.title,
            body: !!this.params.body ? body : product.body,
            vendor: !!this.params.vendor ? vendor : product.vendor,
            tags: !!this.params.tags ? tags : product.tags,
            variants: !!this.params.variants ? variants : product.variants,
        });
    }
}

export interface UpdateProductParams {
    id: string;
    storeId: string;
    title: string;
    body: string;
    tags: string[];
    vendor?: string;
    variants?: Variant[];
}

export class GetProducts implements UseCase {
    private storeId: string;
    private variants: Variant[];
    private images: Images[];
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
                const variants = map.get(product.id);
                if (!!variants) {
                    product.variants = variants;
                }
                return product;
            });

            for (const product of products) {
                const { id } = product;
                product.images = await this.productRepository.getImages(id);
            }
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

export interface Images {
    src: string;
    name: string;
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
        product.images = await this.productRepository.getImages(this.id);

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
