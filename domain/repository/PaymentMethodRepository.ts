import { PaymentMethod } from '../model/PaymentMethod';

export interface PaymentMethodRepository {
    get(storeId: string): Promise<PaymentMethod[]>;
}
