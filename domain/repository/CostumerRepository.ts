import { Costumer, StoreCostumer, CreateParams } from '../model/Costumer';

export interface CostumerRepository {
    add(params: CreateParams): Promise<Costumer>;
    get(id: string): Promise<Costumer>;
    getStoreCostumers(storeId: string): Promise<StoreCostumer[]>;
    addStoreCostumer(storeId: string, id: string): Promise<StoreCostumer[]>;
}
