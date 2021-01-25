export interface PaymentMethod {
	id?: string;
	storeId?: string;
	name?: string;
	type?: PaymentMethodType;
	additionalDetails?: string;
	paymentInstructions?: string;
	isEnabled?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export enum PaymentMethodType {
	BANK_DEPOSIT = "bank_deposit",
	CASH = "cash",
	COD = "cash_on_delivery",
	CUSTOM = "custom",
	EXTERNAL_CREDIT = "external_credit",
	EXTERNAL_DEBIT = "external_debit",
	GIFT_CARD = "gift_card",
	MONEY_ORDER = "money_order",
	STORE_CREDIT = "store_credit",
	CREDIT_CARD = "credit_card",
	DEBIT_CARD = "debit_card",
	PROVIDERS = "providers",
}

export function toPaymentMethodType(type: string): PaymentMethodType {
	switch (type) {
		case 'bank_deposit':
			return PaymentMethodType.BANK_DEPOSIT;
		case 'cash':
			return PaymentMethodType.BANK_DEPOSIT;
		case 'cash_on_delivery':
			return PaymentMethodType.COD;
		case 'external_credit':
			return PaymentMethodType.EXTERNAL_CREDIT;
		case 'external_debit':
			return PaymentMethodType.EXTERNAL_DEBIT;
		case 'gift_card':
			return PaymentMethodType.GIFT_CARD;
		case 'money_order':
			return PaymentMethodType.MONEY_ORDER;
		case 'store_credit':
			return PaymentMethodType.STORE_CREDIT;
		case 'credit_card':
			return PaymentMethodType.CREDIT_CARD;
		case 'debit_card':
			return PaymentMethodType.DEBIT_CARD;
		case 'providers':
			return PaymentMethodType.PROVIDERS;
		case 'custom':
			return PaymentMethodType.CUSTOM;
		default:
			return null;
	}
}
