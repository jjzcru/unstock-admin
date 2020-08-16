import { Product, Option, Variant, Image } from '../model/Product';

// TODO Add store id to missing functions
export interface ProductRepository {
    add(params: AddParams): Promise<Product>;
    addOption(params: AddOptionParams): Promise<Option>;
    addVariant(params: AddVariantParams): Promise<Variant>;
    addImage(params: AddImageParams): Promise<Image>;
    get(storeId: string): Promise<Product[]>;
    getByID(id: string, storeId: string): Promise<Product>;
    getVariants(productId: string): Promise<Variant[]>;
    getVariantsByStore(storeId: string): Promise<Variant[]>;
    getOptions(productId: string): Promise<Option[]>;
    update(params: UpdateParams): Promise<Product>;
    delete(id: string, storeId: string): Promise<Product>;
    deleteVariant(id: string): Promise<Variant>;
    getTags(storeId: string): Promise<string[]>;
}

export interface AddParams {
    storeId: string;
    name: string;
    vendor: string;
    body: string;
    category?: string;
    tags?: string[];
}

export interface AddImageParams {
    image: string;
    productId: string;
}

export interface UpdateParams {
    id: string;
    name?: string;
    body?: string;
    price: number;
    sku?: string;
    barcode?: string;
    inventoryPolicy?: 'allow' | 'block';
    quantity?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AddOptionParams {
    productId: string;
    name: string;
}

export interface AddVariantParams {
    productId: string;
    sku?: string;
    barcode?: string;
    type: 'default' | 'variant';
    price: number;
    inventoryPolicy: 'allow' | 'block';
    quantity: number;
}
