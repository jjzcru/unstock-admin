import { PickupLocation, PickupLocationOption } from '../model/PickupLocation';

export interface PickupLocationRepository {
    add(pickupLocation: PickupLocation): Promise<PickupLocation>;
    update(pickupLocation: PickupLocation): Promise<PickupLocation>;
    delete(id: string): Promise<PickupLocation>;
    getByID(id: string): Promise<PickupLocation>;
    get(storeId: string): Promise<PickupLocation[]>;
    addOption(option: PickupLocationOption): Promise<PickupLocationOption>;
    getOptions(pickupLocationId: string): Promise<PickupLocationOption[]>;
    deleteOption(option: PickupLocationOption): Promise<PickupLocationOption>;
}
