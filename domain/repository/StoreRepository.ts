import { Store, StoreEmail } from '../model/Store';

export interface StoreRepository {
    getStoreByDomain(domain: string): Promise<Store>;
    getStoreById(storeId: string): Promise<Store>;
    getEmail(id: string): Promise<StoreEmail>;
}
