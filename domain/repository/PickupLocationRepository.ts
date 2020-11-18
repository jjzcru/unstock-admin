import { PickupLocation } from '../model/PickupLocation';

export interface PickupLocationRepository {
    add(pickupLocation: PickupLocation): Promise<PickupLocation>;
    update(pickupLocation: PickupLocation): Promise<PickupLocation>;
    delete(id: string): Promise<PickupLocation>;
    getByID(id: string): Promise<PickupLocation>;
    get(storeId: string): Promise<PickupLocation[]>;
}
