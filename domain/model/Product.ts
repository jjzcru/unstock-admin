export interface Product {
    id?: string;
    storeId?: string;
    title?: string;
    body?: string;
    vendor?: string;
    tags?: string[];
    isPublish?: boolean;
    isArchive?: boolean;
    isDeleted?: boolean;
    variants?: Variant[];
    images?: Image[];
    option_1?: string;
    option_2?: string;
    option_3?: string;
    publishAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    slug?: string;
}

export interface Variant {
    id?: string;
    productId?: string;
    sku?: string;
    barcode?: string;
    price?: number;
    inventoryPolicy?: 'allow' | 'block';
    quantity?: number;
    option_1: string;
    option_2: string;
    option_3: string;
    images: any[];
    createdAt?: Date;
    updatedAt?: Date;
    title?: string;
    isTaxable?: boolean;
    tax?: number;
    isEnabled?: boolean;
}

export interface Image {
    id?: string;
    productId?: string;
    image?: string;
}

export interface Option {
    id?: string;
    productId?: string;
    position?: number;
    name?: string;
}

export interface VariantImage {
    id?: string;
    productVariantId?: string;
    productImageId?: string;
    position?: number;
}

/*interface VariantOption {
	id?: string;
	product_variant_id?: string;
	product_option_id?: string;
	name: string;
}*/
