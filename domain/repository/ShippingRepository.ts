import { PickupLocation, PickupLocationOption } from '../model/PickupLocation';
import { ShippingZone, ShippingOption } from '../model/Shipping';

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

export interface ShippingZoneRepository {
    add(shippingZone: ShippingZone): Promise<ShippingZone>;
    update(shippingZone: ShippingZone): Promise<ShippingZone>;
    delete(id: string): Promise<ShippingZone>;
    getByID(id: string): Promise<ShippingZone>;
    get(storeId: string): Promise<ShippingZone[]>;
    addOption(option: ShippingOption): Promise<ShippingOption>;
    updateOption(option: ShippingOption): Promise<ShippingOption>;
    getOptions(zoneId: string): Promise<ShippingOption[]>;
    deleteOption(option: ShippingOption): Promise<ShippingOption>;
}
