export interface Costumer {
	id?: string;
	name?: string;
	email?: string;
	password?: string;
	addresses?: CostumerAddress[];
}

export interface CostumerAddress {
	id?: string;
}
