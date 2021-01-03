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
        const {
            storeId,
            title,
            body,
            tags,
            category,
            vendor,
            option_1,
            option_2,
            option_3,
            slug,
        } = this.params;

        const product = await this.repository.add({
            storeId,
            title,
            vendor,
            body,
            tags,
            category,
            option_1,
            option_2,
            option_3,
            slug,
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
    option_1?: string;
    option_2?: string;
    option_3?: string;
    slug?: string;
}

export class AddProductVariants implements UseCase {
    private productId: string;
    private variant: AddVariantParams;
    private repository: ProductRepository;

    constructor(
        productId: string,
        variant: AddVariantParams,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.productId = productId;
        this.variant = variant;
        this.repository = repository;
    }

    execute(): Promise<Variant[]> {
        return this.repository.addVariant(this.productId, this.variant);
    }
}

export class UpdateProductVariants implements UseCase {
    private variantId: string;
    private variant: AddVariantParams;
    private repository: ProductRepository;

    constructor(
        variantId: string,
        variant: AddVariantParams,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.variantId = variantId;
        this.variant = variant;
        this.repository = repository;
    }

    execute(): Promise<Variant[]> {
        return this.repository.updateVariant(this.variantId, this.variant);
    }
}

export class RemoveProductVariant implements UseCase {
    private variantId: string;
    private repository: ProductRepository;

    constructor(
        variantId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.variantId = variantId;
        this.repository = repository;
    }

    execute(): Promise<boolean> {
        return this.repository.removeVariant(this.variantId);
    }
}

export class AddVariantImage implements UseCase {
    private variantImages: AddVariantImageParams;
    private repository: ProductRepository;

    constructor(
        variantImages: AddVariantImageParams,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.variantImages = variantImages;
        this.repository = repository;
    }

    execute(): Promise<VariantImage[]> {
        return this.repository.addVariantImage(this.variantImages);
    }
}

export class RemoveVariantImage implements UseCase {
    private variantImageId: string;
    private productImageId: string;
    private repository: ProductRepository;

    constructor(
        variantImageId: string,
        productImageId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.variantImageId = variantImageId;
        this.productImageId = productImageId;
        this.repository = repository;
    }

    execute(): Promise<boolean> {
        return this.repository.removeVariantImage(
            this.variantImageId,
            this.productImageId
        );
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

export class DeleteProductImages implements UseCase {
    private imageId: string;
    private storeId: string;
    private repository: ProductRepository;

    constructor(
        imageId: string,
        storeId: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.imageId = imageId;
        this.storeId = storeId;
        this.repository = repository;
    }

    execute(): Promise<boolean> {
        return this.repository.deleteImage(this.imageId, this.storeId);
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
            vendor,
            storeId,
            tags,
            option_1,
            option_2,
            option_3,
        } = this.params;
        console.log(this.params);

        const product = await this.repository.getByID(id, storeId);
        if (!product) {
            throwError('PRODUCT_NOT_FOUND');
        }

        return this.repository.update({
            id,
            title: !!this.params.title ? title : product.title,
            body: !!this.params.body ? body : product.body,
            vendor: !!this.params.vendor ? vendor : product.vendor,
            tags: !!this.params.tags ? tags : product.tags,
            option_1: !!this.params.option_1 ? option_1 : null,
            option_2: !!this.params.option_2 ? option_2 : null,
            option_3: !!this.params.option_3 ? option_3 : null,
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
    option_1?: string;
    option_2?: string;
    option_3?: string;
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
        const variants = [];
        for (const variant of product.variants) {
            variant.images = await this.productRepository.getVariantsImages(
                variant.id
            );
            delete variant.productId;
            delete variant.createdAt;
            delete variant.updatedAt;
            delete variant.inventoryPolicy;
            variants.push(variant);
        }

        product.variants = variants;
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

export class AddVariantInventory implements UseCase {
    private repository: ProductRepository;
    private variantId: string;
    private qty: number;

    constructor(
        variantId: string,
        qty: number,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.variantId = variantId;
        this.qty = qty;
        this.repository = repository;
    }

    async execute(): Promise<boolean> {
        const variant = await this.repository.getVariantById(this.variantId);
        const total = this.qty + variant.quantity;
        return this.repository.updateVariantInventory(this.variantId, total);
    }
}

export class RemoveVariantInventory implements UseCase {
    private repository: ProductRepository;
    private variantId: string;
    private qty: number;

    constructor(
        variantId: string,
        qty: number,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.variantId = variantId;
        this.qty = qty;
        this.repository = repository;
    }

    async execute(): Promise<boolean> {
        const variant = await this.repository.getVariantById(this.variantId);
        const total = variant.quantity - this.qty;
        return this.repository.updateVariantInventory(this.variantId, total);
    }
}

export class ValidSlug implements UseCase {
    private storeId: string;
    private slug: string;
    private productRepository: ProductRepository;

    constructor(
        storeId: string,
        slug: string,
        repository: ProductRepository = new ProductDataRepository()
    ) {
        this.storeId = storeId;
        this.slug = slug;
        this.productRepository = repository;
    }
    async execute(): Promise<boolean> {
        return this.productRepository.validSlug(this.slug, this.storeId);
    }
}
