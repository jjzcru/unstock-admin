export interface Product {
    id?: string;
    storeId?: string;
    name?: string;
    body?: string;
    vendor?: string;
    tags?: string[];
    isPublish?: boolean;
    isArchive?: boolean;
    isDeleted?: boolean;
    variants?: Variant[];
    images?: Image[];
    options?: Option[];
    publishAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Variant {
    id?: string;
    productId?: string;
    sku?: string;
    barcode?: string;
    price?: number;
    inventoryPolicy?: 'allow' | 'block';
    quantity?: number;
    images?: Image[];
    createdAt?: Date;
    updatedAt?: Date;
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

/*interface VariantOption {
	id?: string;
	product_variant_id?: string;
	product_option_id?: string;
	name: string;
}*/
