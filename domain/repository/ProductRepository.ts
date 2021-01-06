import {
    Product,
    Option,
    Variant,
    Image,
    VariantImage,
} from '../model/Product';

// TODO Add store id to missing functions
export interface ProductRepository {
    add(params: AddParams): Promise<Product>;
    addOption(params: AddOptionParams): Promise<Option>;
    addVariant(
        productId: string,
        variant: AddVariantParams
    ): Promise<Variant[]>;
    updateVariant(
        variantId: string,
        variants: AddVariantParams
    ): Promise<Variant[]>;
    removeVariant(variantId: string): Promise<boolean>;
    addVariantImage(image: AddVariantImageParams): Promise<VariantImage[]>;
    removeVariantImage(
        variantImageId: string,
        productImageId: string
    ): Promise<boolean>;
    addImages(
        productId: string,
        images: AddImageParams[],
        storeId: string
    ): Promise<Image[]>;

    deleteImage(imageId: string, storeId: string): Promise<boolean>;
    getImages(productId: string): Promise<Image[]>;
    getImagesByID(id: string): Promise<Image>;
    get(storeId: string): Promise<Product[]>;
    getByID(id: string, storeId: string): Promise<Product>;
    getVariants(productId: string): Promise<Variant[]>;
    getVariantById(id: string): Promise<Variant>;
    getVariantsImages(variantId: string): Promise<VariantImage[]>;
    getVariantsByStore(storeId: string): Promise<Variant[]>;
    update(params: UpdateProductParams): Promise<Product>;
    delete(id: string, storeId: string): Promise<Product>;
    getTags(storeId: string): Promise<string[]>;
    getVendors(storeId: string): Promise<string[]>;
    updateVariantInventory(variantId: string, qty: number): Promise<boolean>;
    validSlug(slug: string, storeId: string): Promise<boolean>;
}

export interface AddParams {
    storeId: string;
    title?: string;
    vendor: string;
    body: string;
    category?: string;
    tags?: string[];
    option_1?: string;
    option_2?: string;
    option_3?: string;
    slug?: string;
}

export interface AddImageParams {
    path: string;
    name: string;
}

export interface UpdateProductParams {
    id: string;
    title?: string;
    body?: string;
    vendor?: string;
    tags?: string[];
    option_1?: string;
    option_2?: string;
    option_3?: string;
    slug?: string;
}

export interface AddOptionParams {
    productId: string;
    name: string;
}

export interface AddVariantParams {
    productId: string;
    sku?: string;
    barcode?: string;
    price: number;
    inventoryPolicy: 'allow' | 'block';
    quantity: number;
    option_1: string;
    option_2: string;
    option_3: string;
}

export interface AddVariantImageParams {
    productVariantId: string;
    productImageId: string;
    position: number;
}
