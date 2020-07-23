export interface Product {
	id?: string;
	store_id?: string;
	name?: string;
	body?: string;
	vendor?: string;
	category?: string;
	tags?: string[];
	is_publish: boolean;
	is_archive: boolean;
	is_deleted: boolean;
	variants?: Variant[];
	images?: Image[];
	options?: Option[];
	publish_at?: Date | null;
	created_at?: Date;
	updated_at?: Date;
}

export interface Variant {
	id?: string;
	product_id?: string;
	sku?: string;
	barcode?: string;
	price?: number;
	inventory_policy?: 'allow' | 'block';
	quantity?: number;
	images?: Image[];
	created_at?: Date;
	updated_at?: Date;
}

export interface Image {
	id?: string;
	product_id?: string;
	image?: string;
}

export interface Option {
	id?: string;
	product_id?: string;
	position?: number;
	name?: string;
}

/*interface VariantOption {
	id?: string;
	product_variant_id?: string;
	product_option_id?: string;
	name: string;
}*/

