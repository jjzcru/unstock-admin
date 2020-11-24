import { Store } from '../model/Store';

export interface StoreRepository {
    getStoreByDomain(domain: string): Promise<Store>;
    getStoreById(storeId: string): Promise<Store>;
}
